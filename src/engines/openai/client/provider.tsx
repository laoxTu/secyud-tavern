'use client';
import {Field, FieldLabel} from "@/components/ui/field";
import React from "react";
import {useTranslations} from "next-intl";
import {Input} from "@/components/ui/input";
import {moduleName} from "@/modules/llmapis/models";
import {LlmapiOutputContext, LlmapiProvider} from "@/modules/llmapis/client/provider-models";
import {engineName, OpenAIConfigModel} from "../models";
import {joinAsString, mergeObjects} from "@/utils";
import {Textarea} from "@/components/ui/textarea";
import {useItemState} from "@/modules/llmapis/client/models";
import {submitTargetFormOnKey} from "@/business/client";
import {BuilderContent, generateInput, getInputBuilderConfig} from "./input-builder";
import {spanFull} from "@/components/custom/grid-field";
import {messageUtils} from "@/modules/models";
import {SlotCalling} from "@/modules/models/calling";
import {OpenAI} from "openai";
import {Selector} from "@/components/custom/selector";

const formats = ["chat", "responses"];

const defaultConfig: OpenAIConfigModel = {
    url: "",
    format: "chat",
    extras: {},
    parameters: {
        model: "",
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
    const [format, setFormat] = React.useState<string | null>(config.format);

    return (
        <>
            <Field>
                <FieldLabel htmlFor={`${moduleName}-format`}>
                    {t(`${moduleName}.format`)}
                </FieldLabel>
                <Selector id={`${moduleName}-format`} name={"format"}
                          items={formats}
                          value={format} onValueChange={setFormat}/>
            </Field>
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
            {
                format === "responses" &&
                <>
                    <Field>
                        <FieldLabel htmlFor={`${moduleName}-max_tokens`}>
                            {t(`${moduleName}.max_tokens`)}
                        </FieldLabel>
                        <Input id={`${moduleName}-max_tokens`}
                               name={"max_output_tokens"}
                               type={"number"} min={0} step={1}
                               defaultValue={config.parameters.max_output_tokens ?? 16}/>
                    </Field>
                </>
            }
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
            <Field className={spanFull}>
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
 * 包含 chat / responses两种format，默认用chat
 */
export async function generateOutput(context: LlmapiOutputContext) {
    const {output, properties, message, stream, slot} = context;
    if (!output) return;

    if (slot.llmapi.content.config?.format === "responses") {
        if (stream) {
            const event: OpenAI.Responses.ResponseStreamEvent = output;

            switch (event.type) {
                case 'response.reasoning_summary_text.delta':
                    message.thought += event.delta;
                    break;
                case 'response.output_text.delta':
                    properties.content ??= "";
                    properties.content += event.delta;
                    messageUtils.setContent(message, properties.content);
                    break;
                // 新增 Item（消息或工具调用）
                case 'response.output_item.added':
                    const item = event.item;
                    if (item.type === 'function_call') {
                        message.callings ??= [];
                        properties.toolCallIndex ??= 0;
                        properties.currentToolCall = {
                            index: properties.toolCallIndex++,
                            id: item.id,
                            name: item.name,
                            arguments: item.arguments ?? "",
                        } as SlotCalling;
                        message.callings.push(properties.currentToolCall)
                    }
                    break;
                case 'response.function_call_arguments.delta':
                    if (properties.currentToolCall) {
                        properties.currentToolCall.arguments += event.delta;
                    }
                    break;
                case "response.completed":
                    context.stopped = !message.callings?.length;
                    break;
            }
        } else {
            const chunk: OpenAI.Responses.Response = output;
            if (chunk.output.every(u => u.type !== "function_call")) {
                context.stopped = true;
            }
            let toolCallId = 0;
            for (const delta of chunk.output) {
                switch (delta.type) {
                    case "function_call": {
                        message.callings?.push({
                            index: toolCallId++,
                            id: delta.call_id,
                            name: delta.name,
                            arguments: delta.arguments ?? "",
                        });
                    }
                        break;
                    case "message":
                        messageUtils.setContent(message, joinAsString(delta.content
                            .filter(u =>
                                u.type === "output_text"), "", u => u.text));
                        break;
                    case "reasoning":
                        if (delta.content) {
                            message.thought += joinAsString(delta.content,
                                "", u => u.text);
                        }
                        break;
                }
            }
        }
    } else {
        if (stream) {
            const chunk: OpenAI.ChatCompletionChunk = output;
            const choice = chunk.choices[0];
            const delta = choice.delta;
            if (choice.finish_reason === "stop") {
                context.stopped = true;
            }
            // 偷懒，deepseek的思考直接放这里了
            const thought: string = (delta as any).reasoning_content;
            message.thought += thought ?? "";
            if (delta.content) {
                properties.content ??= "";
                properties.content += delta.content;
                messageUtils.setContent(message, properties.content);
            }
            // 流式 tool_calls 分片到达，按 index 归并，arguments 逐段拼接。
            if (delta.tool_calls?.length) {
                message.callings ??= [];
                for (const tool_call of delta.tool_calls) {
                    const index = message.callings
                        .findIndex(u => u.index === tool_call.index);
                    let calling: SlotCalling | null = null;
                    if (index < 0) {
                        calling = {
                            index: tool_call.index,
                            id: tool_call.id,
                            name: tool_call.function?.name,
                            arguments: tool_call.function?.arguments ?? "",
                        } as SlotCalling;
                        message.callings.push(calling);
                    } else {
                        calling = message.callings[index];
                    }
                    calling.id ??= tool_call.id ?? "";
                    calling.name ??= tool_call.function?.name ?? "";
                    if (tool_call.function?.arguments)
                        calling.arguments += tool_call.function.arguments;
                }
            }
        } else {
            const chunk: OpenAI.ChatCompletion = output;
            const choice = chunk.choices[0];
            const delta = choice.message;
            if (choice.finish_reason === "stop") {
                context.stopped = true;
            }
            const thought: string = (delta as any).reasoning_content;
            message.thought += thought ?? "";
            messageUtils.setContent(message, delta.content);
            if (delta.tool_calls)
                for (let i = 0; i < delta.tool_calls.length; i++) {
                    const tool_call = delta.tool_calls[i];
                    if (tool_call.type === "function") {
                        message.callings?.push({
                            index: i,
                            id: tool_call.id,
                            name: tool_call.function?.name,
                            arguments: tool_call.function?.arguments ?? "",
                        });
                    }
                }
        }
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
            const format = data.get("format") as any ?? "chat";
            return {
                format: format,
                inputBuilder: getInputBuilderConfig(data),
                url: data.get('url') as string,
                extras: extras,
                parameters: {
                    model: data.get('model') as string,
                    temperature: Number(data.get('temperature')),
                    top_p: Number(data.get('top_p')),
                    presence_penalty: Number(data.get('presence_penalty')),
                    frequency_penalty: Number(data.get('frequency_penalty')),
                    ...(format === "responses" ? {
                        max_output_tokens: Number(data.get('max_output_tokens')),
                    } : {})
                },
            };
        },
        generateOutput,
        generateInput,
    } as const;