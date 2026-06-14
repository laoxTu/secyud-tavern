import {
    compareLorebook,
    engineArrayName, getEndLorebooks,
    getStartLorebooks, LorebookInputBuilderModel,
    PresetLorebookModel
} from "@/engines/lorebooks/models";
import {LlmapiMessage} from "@/slots/models";
import {LlmapiBuilderProps, LlmapiInputBuilder} from "@/llmapis/client/input-builder-models";
import {LlmapiInputContext} from "@/slots/client/conversation-models";
import {getCurrentOutput} from "@/stories/models";
import {useTranslations} from "next-intl";
import {mergeObjects} from "@/utils";
import {Field, FieldLabel} from "@/components/ui/field";
import {moduleName} from "@/llmapis/models";
import {Input} from "@/components/ui/input";
import React from "react";

export async function defaultBuildInput(
    ctx: LlmapiInputContext, config: LorebookInputBuilderModel) {
    const histories = ctx.histories;

    const cache: { role: string, content: string[] } = {
        role: "",
        content: [],
    }
    const llmapiMessages: LlmapiMessage[] = [];
    const visitedLorebooks = new Set<string>();
    for (let i = 0; i < histories.length; i++) {
        const history = histories[i];
        const lorebooks = history.properties[engineArrayName] as PresetLorebookModel[];
        if (i === 0)
            fillLorebooks(lorebooks, getStartLorebooks(ctx.content));
        else if (i === histories.length - 1)
            fillLorebooks(lorebooks, getEndLorebooks(ctx.content));

        let j = 0;
        for (; j < lorebooks.length; j++) {
            const lorebook = lorebooks[j];
            if (lorebook.layer >= 100) break;
            tryPushMessage(lorebook.role, lorebook.content);
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
            tryPushMessage(lorebook.role, lorebook.content);
        }

        const output = getCurrentOutput(history);
        if (output) {
            tryPushMessage("assistant", output.content);
        }
    }

    tryPushMessage("", "");

    console.debug("llmapiMessages: ");
    console.debug(llmapiMessages);
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

        if (messageRole === cache.role) {
            cache.content.push(messageContent);
        } else {
            if (cache.content.length > 0) {
                llmapiMessages.push({
                    role: cache.role,
                    content: cache.content.join("\n")
                });
            }
            cache.role = messageRole;
            cache.content.length = 0;
        }
    }
}

const defaultConfig: LorebookInputBuilderModel = {
    prefix: "",
    suffix: "",
} as const;

function Content({defaultValue}: LlmapiBuilderProps) {
    const t = useTranslations();
    const config: LorebookInputBuilderModel = mergeObjects(defaultConfig, defaultValue);

    return (
        <>
            <div className="grid grid-cols-2 gap-4">
                <Field>
                    <FieldLabel htmlFor={`${moduleName}-builder-prefix`}>
                        {t(`${moduleName}.user_input_prefix`)}
                    </FieldLabel>
                    <Input id={`${moduleName}-builder-prefix`} name={"builder-prefix"}
                           type={"number"} max={2} min={0} step={0.05}
                           defaultValue={config.prefix}/>
                </Field>
                <Field>
                    <FieldLabel htmlFor={`${moduleName}-builder-suffix`}>
                        {t(`${moduleName}.user_input_suffix`)}
                    </FieldLabel>
                    <Input id={`${moduleName}-builder-suffix`} name={"builder-suffix"}
                           type={"number"} max={2} min={0} step={0.05}
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