'use client';
import {Field, FieldContent, FieldLabel} from "@/components/ui/field";
import React from "react";
import {useTranslations} from "next-intl";
import {Input} from "@/components/ui/input";
import {moduleName} from "@/modules/llmapis/models";
import {LlmapiConfig} from "@/modules/llmapis/client/config-models";
import {DeepseekConfigModel, engineName} from "../models";
import {mergeObjects} from "@/utils";
import {Checkbox} from "@/components/ui/checkbox";
import {useItemState} from "@/modules/llmapis/client/models";
import {Selector} from "@/components/custom/selector";

const models = ["deepseek-v4-flash", "deepseek-v4-pro"];
const reasoningEfforts = ["high", "max"];

const defaultConfig: DeepseekConfigModel = {
    parameters: {
        model: "deepseek-v4-flash",
        thinking: {
            type: "enabled"
        },
        reasoning_effort: "high",
        stream: true,
        temperature: 1,
        top_p: 1,
        logprobs: false,
        top_logprobs: 10,
        max_tokens: 0
    }
} as const;

function Content() {
    const t = useTranslations();
    const {model} = useItemState();
    const config: DeepseekConfigModel = mergeObjects(
        defaultConfig, model?.content["config"]);
    const [thinking, setThinking] = React.useState<boolean>(
        config.parameters.thinking.type === "enabled");


    return (
        <>
            <div className="grid md:grid-cols-2 gap-4">
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
                    <FieldLabel htmlFor={`${moduleName}-model`}>
                        {t(`${moduleName}.model`)}
                    </FieldLabel>
                    <Selector name={'model'} id={`${moduleName}-model`}
                              defaultValue={config.parameters.model} items={models}
                              labelAccessor={e => t(`deepseek.${e}`)}/>
                </Field>
                <Field>
                    <FieldLabel htmlFor={`${moduleName}-thinking`}>
                        {t(`${moduleName}.thinking`)}
                    </FieldLabel>
                    <FieldContent>
                        <Checkbox id={`${moduleName}-thinking`} name={"thinking"}
                                  checked={thinking}
                                  onCheckedChange={e => setThinking(e)}/>
                    </FieldContent>
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
                    <FieldLabel htmlFor={`${moduleName}-max_tokens`}>
                        {t(`${moduleName}.max_tokens`)}
                    </FieldLabel>
                    <Input id={`${moduleName}-max_tokens`} name={"max_tokens"}
                           type={"number"} min={0} step={1}
                           defaultValue={config?.parameters.max_tokens}/>
                </Field>
                <Field>
                    <FieldLabel htmlFor={`${moduleName}-logprobs`}>
                        {t(`${moduleName}.logprobs`)}
                    </FieldLabel>
                    <FieldContent>
                        <Checkbox id={`${moduleName}-logprobs`} name={"logprobs"}
                                  defaultChecked={config.parameters.logprobs}
                                  disabled/>
                    </FieldContent>
                </Field>
                <Field>
                    <FieldLabel htmlFor={`${moduleName}-top_logprobs`}>
                        {t(`${moduleName}.top_logprobs`)}
                    </FieldLabel>
                    <Input id={`${moduleName}-top_logprobs`} name={"top_logprobs"}
                           type={"number"} max={20} min={0} step={0.1} disabled
                           defaultValue={config?.parameters.top_logprobs}/>
                </Field>
                <Field className={thinking ? "" : "hidden"}>
                    <FieldLabel htmlFor={`${moduleName}-reasoning_effort`}>
                        {t(`${moduleName}.reasoning_effort`)}
                    </FieldLabel>
                    <Selector name={'reasoning_effort'}
                              id={`${moduleName}-reasoning_effort`}
                              defaultValue={config.parameters.reasoning_effort}
                              items={reasoningEfforts}/>
                </Field>
                <Field className={thinking ? "hidden" : ""}>
                    <FieldLabel htmlFor={`${moduleName}-temperature`}>
                        {t(`${moduleName}.temperature`)}
                    </FieldLabel>
                    <Input id={`${moduleName}-temperature`} name={"temperature"}
                           type={"number"} max={2} min={0} step={0.05}
                           defaultValue={config?.parameters.temperature}/>
                </Field>
                <Field className={thinking ? "hidden" : ""}>
                    <FieldLabel htmlFor={`${moduleName}-top_p`}>
                        {t(`${moduleName}.top_p`)}
                    </FieldLabel>
                    <Input id={`${moduleName}-top_p`} name={"top_p"}
                           type={"number"} max={2} min={0} step={0.05}
                           defaultValue={config?.parameters.top_p}/>
                </Field>
            </div>
        </>
    );
}

export const config: LlmapiConfig =
    {
        id: engineName,
        component: Content,
        getValue: (data): DeepseekConfigModel => {
            return {
                parameters: {
                    model: data.get('model') as string,
                    thinking: {
                        type: (Boolean(data.get('thinking') as string) ? "enabled" : "disabled"),
                    },
                    reasoning_effort: data.get('reasoning_effort') as string,
                    stream: Boolean(data.get('stream') as string),
                    temperature: Number(data.get('temperature') as string),
                    max_tokens: Math.trunc(Number(data.get('max_tokens') as string)),
                    top_p: Number(data.get('top_p') as string),
                    logprobs: Boolean(data.get('logprobs') as string),
                    top_logprobs: Number(data.get('top_logprobs') as string)
                }
            };
        }
    } as const;