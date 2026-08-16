'use client';
import {Field, FieldContent, FieldLabel} from "@/components/ui/field";
import React from "react";
import {useTranslations} from "next-intl";
import {Input} from "@/components/ui/input";
import {moduleName} from "@/modules/llmapis/models";
import {LlmapiProvider} from "@/modules/llmapis/client/provider-models";
import {OpenAIConfigModel, engineName} from "../models";
import {mergeObjects} from "@/utils";
import {Checkbox} from "@/components/ui/checkbox";
import {Textarea} from "@/components/ui/textarea";
import {useItemState} from "@/modules/llmapis/client/models";
import {submitTargetFormOnKey} from "@/business/client";
import {StoryOutputCalling} from "@/modules/stories/models";
import {extractVariableChanges} from "@/modules/slots/models";
import {LlmapiOutputContext} from "@/modules/slots/client/conversation-models";
import {BuilderContent, generateInput, getInputBuilderConfig} from "./input-builder";

const defaultConfig: OpenAIConfigModel = {
    url: "",
    extras: {},
    parameters: {
        model: "",
        stream: true,
        temperature: 1,
        top_p: 1,
        presence_penalty: 0,
        frequency_penalty: 0
    },
    inputBuilder: {
        type: "default",
    }

} as const;

function Content() {
    const t = useTranslations();
    const {model} = useItemState();
    const config: OpenAIConfigModel = mergeObjects(
        defaultConfig, model?.content["config"]);

    return (
        <>
            <div className="grid md:grid-cols-2 gap-4">
                <Field>
                    <FieldLabel htmlFor={`${moduleName}-url`}>
                        {t(`${moduleName}.url`)}
                    </FieldLabel>
                    <Input id={`${moduleName}-url`} name={"url"}
                           defaultValue={config.url}/>
                </Field>
                <Field>
                    <FieldLabel htmlFor={`${moduleName}-model`}>
                        {t(`${moduleName}.model`)}
                    </FieldLabel>
                    <Input id={`${moduleName}-model`} name={"model"}
                           defaultValue={config.parameters.model}/>
                </Field>
                <Field>
                    <FieldLabel htmlFor={`${moduleName}-apikey`}>
                        {t(`${moduleName}.apikey`)}
                    </FieldLabel>
                    <Input id={`${moduleName}-apikey`}
                           name={"apikey"}
                           type={"password"}
                           autoComplete={'off'}
                           defaultValue={model?.key}/>
                </Field>
                <Field>
                    <FieldLabel htmlFor={`${moduleName}-stream`}>
                        {t(`${moduleName}.stream`)}
                    </FieldLabel>
                    <FieldContent>
                        <Checkbox id={`${moduleName}-stream`} name={"stream"}
                                  defaultChecked={config.parameters.stream}/>
                    </FieldContent>
                </Field>
                <Field>
                    <FieldLabel htmlFor={`${moduleName}-temperature`}>
                        {t(`${moduleName}.temperature`)}
                    </FieldLabel>
                    <Input id={`${moduleName}-temperature`} name={"temperature"}
                           type={"number"} max={2} min={0} step={0.05}
                           defaultValue={config.parameters.temperature}/>
                </Field>
                <Field>
                    <FieldLabel htmlFor={`${moduleName}-top_p`}>
                        {t(`${moduleName}.top_p`)}
                    </FieldLabel>
                    <Input id={`${moduleName}-top_p`} name={"top_p"}
                           type={"number"} max={2} min={0} step={0.05}
                           defaultValue={config.parameters.top_p}/>
                </Field>
                <Field>
                    <FieldLabel htmlFor={`${moduleName}-presence_penalty`}>
                        {t(`${moduleName}.presence_penalty`)}
                    </FieldLabel>
                    <Input id={`${moduleName}-presence_penalty`} name={"presence_penalty"}
                           type={"number"} max={2} min={-2} step={0.05}
                           defaultValue={config.parameters.presence_penalty}/>
                </Field>
                <Field>
                    <FieldLabel htmlFor={`${moduleName}-frequency_penalty`}>
                        {t(`${moduleName}.frequency_penalty`)}
                    </FieldLabel>
                    <Input id={`${moduleName}-frequency_penalty`} name={"frequency_penalty"}
                           type={"number"} max={2} min={-2} step={0.05}
                           defaultValue={config.parameters.frequency_penalty}/>
                </Field>
                <BuilderContent config={config.inputBuilder}/>
            </div>
            <Field>
                <FieldLabel htmlFor={`${moduleName}-extras`}>
                    {t(`${moduleName}.extras`)}
                </FieldLabel>
                <Textarea id={`${moduleName}-extras`} name={"extras"}
                          defaultValue={JSON.stringify(config.extras)}
                          onKeyDown={submitTargetFormOnKey}/>
            </Field>
        </>
    );
}


/**
 * open ai 的输出解析。
 * deepseek用的也是这个，这里提取出来复用。
 */
export async function generateOutput(context: LlmapiOutputContext) {
    const {output, content, message} = context;
    if (output?.finish_reason === "stop") {
        context.stopped = true;
    }

    if (output?.reasoning_content) {
        message.thought += output.reasoning_content;
    }
    if (output?.content) {
        content.content ??= "";
        content.content += output.content;
        extractVariableChanges(message, content.content);
    }
    // 流式 tool_calls 分片到达，按 index 归并，arguments 逐段拼接。
    if (output?.tool_calls) {
        for (const toolCall of output.tool_calls) {
            message.callings ??= [];
            const index = message.callings
                .findIndex(u => u.index === toolCall.index);
            let current =
                index >= 0 ? message.callings[index] : createToolCall(toolCall);
            current.id ??= toolCall.id;
            current.name ??= toolCall.function?.name;
            if (toolCall.function?.arguments)
                current.arguments += toolCall.function.arguments;
        }
    }

    function createToolCall(toolCall: any) {
        const current = {
            index: toolCall.index,
            id: toolCall.id,
            name: toolCall.function?.name,
            arguments: toolCall.function?.arguments ?? "",
        } as StoryOutputCalling;
        message.callings?.push(current)
        return current;
    }
}


export const provider: LlmapiProvider =
    {
        id: engineName,
        component: Content,
        getValue: (data): OpenAIConfigModel => {
            let extras: any = data.get('extras') as string;
            try {
                extras = JSON.parse(extras);
            } catch (_) {
                extras = {};
            }
            return {
                parameters: {
                    model: data.get('model') as string,
                    stream: !!data.get('stream'),
                    temperature: Number(data.get('temperature')),
                    top_p: Number(data.get('top_p')),
                    presence_penalty: Number(data.get('presence_penalty')),
                    frequency_penalty: Number(data.get('frequency_penalty')),
                },
                inputBuilder: getInputBuilderConfig(data),
                url: data.get('url') as string,
                extras: extras,
            };
        },
        generateOutput,
        generateInput,
    } as const;