'use client';
import {Field, FieldLabel} from "@/components/ui/field";
import React from "react";
import {useTranslations} from "next-intl";
import {Input} from "@/components/ui/input";
import {moduleName} from "@/modules/llmapis/models";
import {LlmapiOutputContext, LlmapiProvider} from "@/modules/llmapis/client/provider-models";
import {AnthropicConfigModel, engineName} from "../models";
import {mergeObjects} from "@/utils";
import {Textarea} from "@/components/ui/textarea";
import {useItemState} from "@/modules/llmapis/client/models";
import {submitTargetFormOnKey} from "@/business/client";
import {BuilderContent, generateInput, getInputBuilderConfig} from "./input-builder";
import {rowHalf, spanHalf} from "@/components/custom/grid-field";
import Anthropic from "@anthropic-ai/sdk";
import {messageUtils} from "@/modules/models";
import {cn} from "@/lib/utils";

const defaultConfig: AnthropicConfigModel = {
    url: "",
    extras: {},
    parameters: {
        model: "",
        temperature: 1,
        top_p: 1,
        max_tokens: 8192,
    },
    inputBuilder: {
        type: "default",
    }

} as const;

function Content() {
    const t = useTranslations();
    const {model} = useItemState();
    const config: AnthropicConfigModel = mergeObjects(
        defaultConfig, model?.content["config"]);

    return (
        <>
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
            <Field>
                <FieldLabel htmlFor={`${moduleName}-max_tokens`}>
                    {t(`${moduleName}.max_tokens`)}
                </FieldLabel>
                <Input id={`${moduleName}-max_tokens`} name={"max_tokens"}
                       type={"number"} min={1} step={1}
                       defaultValue={config.parameters.max_tokens}/>
            </Field>
            <BuilderContent config={config.inputBuilder}/>
            <Field className={cn(spanHalf, rowHalf)}>
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
 * anthropic 的输出解析。
 */
export async function generateOutput(context: LlmapiOutputContext) {
    const {output, properties, message, stream} = context;
    if (!output) return;
    if (stream) {
        const chunk: Anthropic.RawMessageStreamEvent = output;
        if (chunk.type === "message_delta" &&
            chunk.delta.stop_reason === "end_turn") {
            context.stopped = true;
        }

        if (chunk.type === "content_block_start") {
            if (chunk.content_block.type === "tool_use") {
                const delta = chunk.content_block;
                message.callings ??= [];
                message.callings.push({
                    index: message.callings.length,
                    id: delta.id,
                    name: delta.name,
                    arguments: "",
                });
            }
        } else if (chunk.type === "content_block_delta") {
            const delta = chunk.delta;

            switch (delta.type) {
                case "text_delta":
                    properties.content ??= "";
                    properties.content += delta.text;
                    messageUtils.setContent(message, properties.content);
                    break;
                case "signature_delta":
                    message.properties["signature"] += delta.signature;
                    break;
                case "thinking_delta":
                    message.thought += delta.thinking;
                    break;
                case "input_json_delta":
                    if (message.callings) {
                        const calling = message.callings.at(-1)!;
                        calling.arguments += delta.partial_json;
                    }
                    break;

            }
        }
    } else {
        const chunk: Anthropic.Message = output;
        if (chunk.stop_reason === "end_turn") {
            context.stopped = true;
        }
        let toolIndex = 0;
        for (const delta of chunk.content) {
            switch (delta.type) {
                case "text":
                    message.content += delta.text;
                    break;
                case "thinking":
                    message.thought += delta.thinking;
                    message.properties["signature"] = delta.signature;
                    break;
                case "tool_use":
                    message.callings ??= [];
                    message.callings.push({
                        index: toolIndex++,
                        id: delta.id,
                        name: delta.name,
                        arguments: JSON.stringify(delta.input ?? {}),
                    });
                    break;
            }
        }
    }
}


export const provider: LlmapiProvider =
    {
        id: engineName,
        component: Content,
        getValue: (data): AnthropicConfigModel => {
            let extras: any = data.get('extras') as string;
            try {
                extras = JSON.parse(extras);
            } catch (_) {
                extras = {};
            }
            return {
                parameters: {
                    model: data.get('model') as string,
                    temperature: Number(data.get('temperature')),
                    top_p: Number(data.get('top_p')),
                    max_tokens: Number(data.get('max_tokens')),
                },
                inputBuilder: getInputBuilderConfig(data),
                url: data.get('url') as string,
                extras: extras,
            };
        },
        generateOutput,
        generateInput,
    } as const;