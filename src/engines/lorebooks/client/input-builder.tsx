import {
    compareLorebook,
    engineArrayName,
    LorebookInputBuilderModel,
    PresetLorebookModel
} from "@/engines/lorebooks/models";
import {LlmapiMessage} from "@/slots/models";
import {LlmapiInputBuilder} from "@/llmapis/client/input-builder-models";
import {LlmapiInputContext} from "@/slots/client/conversation-models";
import {getCurrentOutput} from "@/stories/models";
import {useTranslations} from "next-intl";
import {mergeObjects} from "@/utils";
import {Field, FieldLabel} from "@/components/ui/field";
import {moduleName} from "@/llmapis/models";
import {Input} from "@/components/ui/input";
import React from "react";
import {useItemState} from "@/llmapis/client/models";
import {LorebookConversationCache} from "@/engines/lorebooks/client/conversation";

export async function defaultBuildInput(
    ctx: LlmapiInputContext, config: LorebookInputBuilderModel) {
    const histories = ctx.histories;

    const cache: { role: string, content: string[] } = {
        role: "",
        content: [],
    }
    const llmapiMessages: LlmapiMessage[] = [];
    const visitedLorebooks = new Set<string>();
    const entries: LorebookConversationCache = ctx.slot.content[engineArrayName];
    for (let i = 0; i < histories.length; i++) {
        const history = histories[i];
        const lorebooks = history.properties[engineArrayName] as PresetLorebookModel[];
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
        if (output) {
            tryPushMessage("assistant", output.content);
        }
    }

    tryPushMessage("", "");

    console.debug("llmapiMessages: ", llmapiMessages);
    return llmapiMessages;

    function fillLorebooks(lorebooks: PresetLorebookModel[], added: PresetLorebookModel[]) {
        for (const add of added) {
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

        if (messageRole !== cache.role) {
            if (cache.content.length > 0) {
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


export const llmapiLorebookInputBuilder: LlmapiInputBuilder =
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