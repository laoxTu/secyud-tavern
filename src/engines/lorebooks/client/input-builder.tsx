import {
    compareLorebook,
    enginePlural,
    LorebookInputBuilderModel,
    PresetLorebookModel
} from "@/engines/lorebooks/models";
import {getCurrentOutput, isContentRole, LlmapiMessageModel, SlotModel} from "@/modules/slots/models";
import {LlmapiInputBuilder} from "@/modules/llmapis/client/input-builder-models";
import {LlmapiInputContext} from "@/modules/slots/client/conversation-models";
import {useTranslations} from "next-intl";
import {mergeObjects} from "@/utils";
import {Field, FieldLabel} from "@/components/ui/field";
import {moduleName} from "@/modules/llmapis/models";
import {Input} from "@/components/ui/input";
import React from "react";
import {useItemState} from "@/modules/llmapis/client/models";
import {LorebookConversationCache} from "@/engines/lorebooks/client/conversation";
import {fillToolCallContent} from "@/engines/tools/client/conversation";
import {StoryOutputMessage} from "@/modules/stories/models";

function pushMessage(
    messageRole: string,
    messageContent: string,
    cache: { role: string, content: string[] },
    llmapiMessages: LlmapiMessageModel[]
) {
    if (messageRole !== cache.role) {
        if (cache.content.length > 0 && isContentRole(cache.role)) {
            console.debug("generate message:", {
                role: cache.role,
                content: [...cache.content],
            });
            llmapiMessages.push({
                role: cache.role,
                content: cache.content.join("\r\n")
            });
        }
        cache.role = messageRole;
        cache.content.length = 0;
    }
    console.debug("push message:", {
        messageRole, messageContent
    });
    cache.content.push(messageContent);
}

async function tryPushOutputMessage(
    output: StoryOutputMessage,
    ctx: { slot: SlotModel },
    cache: { role: string, content: string[] },
    llmapiMessages: LlmapiMessageModel[],
) {
    if (output.toolCalls?.length) {
        llmapiMessages.push({
            role: "assistant",
            content: cache.content.join("\r\n"),
            toolCalls: output.toolCalls.map(u => ({
                ...u,
                content: undefined
            })),
        });
        cache.role = "";
        cache.content.length = 0;
        await fillToolCallContent(output.toolCalls, ctx.slot);
        for (const toolCall of output.toolCalls) {
            if (!toolCall.content) continue;
            llmapiMessages.push({
                role: "tool",
                toolCallId: toolCall.id,
                content: toolCall.content
            });
        }
    }
}

export async function defaultBuildInput(
    ctx: LlmapiInputContext, config: LorebookInputBuilderModel) {
    // 待填充的历史，从最后一个summary开始
    const histories = ctx.histories;

    const cache: { role: string, content: string[] } = {
        role: "",
        content: [],
    }
    const llmapiMessages: LlmapiMessageModel[] = [];
    const visitedLorebooks = new Set<string>();
    const entries: LorebookConversationCache = ctx.slot.content[enginePlural];
    for (let i = 0; i < histories.length; i++) {
        const history = histories[i];
        // 这里是api history 缓存，和message的properties不是同一实例
        const lorebooks = history.properties[enginePlural] as PresetLorebookModel[];
        if (i === 0)
            fillLorebooks(lorebooks, entries.before);
        else if (i === histories.length - 1)
            fillLorebooks(lorebooks, entries.after);

        let j = 0;
        for (; j < lorebooks.length; j++) {
            const lorebook = lorebooks[j];
            if (lorebook.layer >= 100) break;
            tryPushMessage(lorebook.role, lorebook.content, lorebook);
        }

        if (history.inputs.length > 0) {
            tryPushMessage("user", config.prefix);
            for (const input of history.inputs) {
                tryPushMessage("user", input.content);
            }
            tryPushMessage("user", config.suffix);
        }

        for (; j < lorebooks.length; j++) {
            const lorebook = lorebooks[j];
            tryPushMessage(lorebook.role, lorebook.content, lorebook);
        }

        const output = getCurrentOutput(history);
        if (output && i < histories.length - 1) {
            tryPushMessage("assistant", output.content);
            await tryPushOutputMessage(output, ctx, cache, llmapiMessages);
        }
    }

    tryPushMessage("", "");

    console.debug("llmapiMessages: ", llmapiMessages);
    return llmapiMessages;

    function fillLorebooks(lorebooks: PresetLorebookModel[], adds: PresetLorebookModel[]) {
        for (const add of adds) {
            lorebooks.push(add);
        }
        lorebooks.sort(compareLorebook);
    }

    function tryPushMessage(
        messageRole: string, messageContent: string,
        lorebook?: PresetLorebookModel) {
        if (lorebook) {
            if (visitedLorebooks.has(lorebook.code)) return;
            visitedLorebooks.add(lorebook.code);
        }

        pushMessage(messageRole, messageContent, cache, llmapiMessages);
    }
}

export async function layeredBuildInput(
    ctx: LlmapiInputContext, config: LorebookInputBuilderModel) {
    // 待填充的历史，从最后一个summary开始
    const histories = ctx.histories;

    const cache: { role: string, content: string[] } = {
        role: "",
        content: [],
    }
    const llmapiMessages: LlmapiMessageModel[] = [];
    const visitedLorebooks = new Set<string>();
    const entries: LorebookConversationCache = ctx.slot.content[enginePlural];
    const lorebooks: PresetLorebookModel[] = [...entries.before, ...entries.after];

    for (const history of histories) {
        const activeLorebooks = history.properties[enginePlural] as PresetLorebookModel[];
        for (const activeLorebook of activeLorebooks) {
            if (visitedLorebooks.has(activeLorebook.code)) continue;
            lorebooks.push(activeLorebook);
        }
    }

    lorebooks.sort(compareLorebook);

    let li = 0;
    for (let i = 0; i < histories.length; i++) {
        const history = histories[i];
        for (; li < lorebooks.length; li++) {
            const lorebook = lorebooks[li];
            if (lorebook.layer >= i - lorebooks.length + 100) break;
            tryPushMessage(lorebook.role, lorebook.content);
        }

        if (history.inputs.length > 0) {
            tryPushMessage("user", config.prefix);
            for (const input of history.inputs) {
                tryPushMessage("user", input.content);
            }
            tryPushMessage("user", config.suffix);
        }

        const output = getCurrentOutput(history);
        if (output && i < histories.length - 1) {
            tryPushMessage("assistant", output.content);
            await tryPushOutputMessage(output, ctx, cache, llmapiMessages);
        }
    }

    for (; li < lorebooks.length; li++) {
        const lorebook = lorebooks[li];
        tryPushMessage(lorebook.role, lorebook.content);
    }

    tryPushMessage("", "");

    console.debug("llmapiMessages: ", llmapiMessages);
    return llmapiMessages;

    function tryPushMessage(messageRole: string, messageContent: string) {
        pushMessage(messageRole, messageContent, cache, llmapiMessages);
    }
}

const defaultConfig: LorebookInputBuilderModel = {
    prefix: "",
    suffix: "",
} as const;

function Content() {
    const t = useTranslations();
    const {model} = useItemState();
    const config: LorebookInputBuilderModel = mergeObjects(
        defaultConfig, model?.content["builder"]);

    return (
        <>
            <div className="grid md:grid-cols-2 gap-4">
                <Field>
                    <FieldLabel htmlFor={`${moduleName}-builder-prefix`}>
                        {t(`${moduleName}.user_input_prefix`)}
                    </FieldLabel>
                    <Input id={`${moduleName}-builder-prefix`} name={"builder-prefix"}
                           defaultValue={config.prefix}/>
                </Field>
                <Field>
                    <FieldLabel htmlFor={`${moduleName}-builder-suffix`}>
                        {t(`${moduleName}.user_input_suffix`)}
                    </FieldLabel>
                    <Input id={`${moduleName}-builder-suffix`} name={"builder-suffix"}
                           defaultValue={config.suffix}/>
                </Field>
            </div>
        </>
    );
}


export const llmapiLorebookCachedInputBuilder: LlmapiInputBuilder =
    {
        id: "default",
        component: Content,
        getValue: (data): LorebookInputBuilderModel => {
            return {
                prefix: data.get('builder-prefix') as string,
                suffix: data.get('builder-suffix') as string,
            };
        },
        onBuildInput: defaultBuildInput
    } as const;

export const llmapiLorebookLayeredInputBuilder: LlmapiInputBuilder =
    {
        id: "layered",
        component: Content,
        getValue: (data): LorebookInputBuilderModel => {
            return {
                prefix: data.get('builder-prefix') as string,
                suffix: data.get('builder-suffix') as string,
            };
        },
        onBuildInput: layeredBuildInput
    } as const;