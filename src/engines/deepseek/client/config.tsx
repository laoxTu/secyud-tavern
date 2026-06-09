'use client';
import {Field, FieldLabel} from "@/components/ui/field";
import React from "react";
import {useTranslations} from "next-intl";
import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {moduleName} from "@/llmapis/models";
import {LlmapiConfig, LlmapiConfigProps} from "@/llmapis/client/config-models";
import {DeepseekConfigModel, engineName} from "../models";

function isDeepseekConfig(data: any): boolean {
    return data && data.parameters &&
        typeof data.parameters.model === 'string' &&
        typeof data.parameters.reasoning_effort === 'string' &&
        typeof data.parameters.stream === 'boolean' &&
        data.parameters.thinking &&
        typeof data.parameters.thinking.type === 'string';
}

const models = ["deepseek-v4-flash", "deepseek-v4-pro"];

const defaultConfig: DeepseekConfigModel = {
    parameters: {
        model: "deepseek-v4-flash",
        thinking: {
            "type": "enabled"
        },
        reasoning_effort: "high",
        stream: true
    }
} as const;

function Content({defaultValue, llmapi}: LlmapiConfigProps) {
    const t = useTranslations();
    if (!isDeepseekConfig(defaultValue)) {
        defaultValue = defaultConfig;
    }

    return (
        <>
            <Field>
                <FieldLabel htmlFor={`${moduleName}-apikey`}>
                    {t(`${moduleName}.apikey`)}
                </FieldLabel>
                <Input id={`${moduleName}-apikey`} name={"apikey"} type={"password"}
                       defaultValue={llmapi?.key}/>
            </Field>
            <Field>
                <FieldLabel htmlFor={`${moduleName}-model`}>
                    {t(`${moduleName}.model`)}
                </FieldLabel>
                <Select name="provider" defaultValue={defaultValue.parameters.model}>
                    <SelectTrigger className="w-full"
                                   id={`${moduleName}-model`}>
                        <SelectValue/>
                    </SelectTrigger>
                    <SelectContent position="popper">
                        <SelectGroup>
                            {models.map((e) =>
                                <SelectItem key={e} value={e}>
                                    {t(`deepseek.${e}`)}
                                </SelectItem>
                            )}
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </Field>
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
                        "type": "enabled"
                    },
                    reasoning_effort: "high",
                    stream: true
                }
            };
        }
    } as const;