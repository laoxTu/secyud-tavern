'use client';
import {LlmapiConfig, LlmapiConfigProps} from ".";
import {Field, FieldLabel} from "@/components/ui/field";
import React from "react";
import {useTranslations} from "next-intl";
import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {name as modelType} from "@/shared/business/llmapis";
import {name as configId} from "@/shared/business/llmapis/engines/deepseek";

const models = ["deepseek-v4-flash", "deepseek-v4-pro"];

function Content({defaultValue}: LlmapiConfigProps) {
    const t = useTranslations();
    if (!Array.isArray(defaultValue) && !defaultValue.every((item: any) => typeof item === "string"))
        defaultValue = [];

    return (
        <>
            <Field>
                <FieldLabel htmlFor={`${modelType}-apikey`}>
                    {t(`${modelType}.apikey`)}
                </FieldLabel>
                <Input id={`${modelType}-apikey`} name={"apikey"} type={"password"}
                       defaultValue={defaultValue?.apikey}/>
            </Field>
            <Field>
                <FieldLabel htmlFor={`${modelType}-model`}>
                    {t(`${modelType}.model`)}
                </FieldLabel>
                <Input id={`${modelType}-model`} name={"model"}
                       defaultValue={defaultValue?.apikey}/>
                <Select name="provider" defaultValue={defaultValue?.model}>
                    <SelectTrigger className="w-full"
                                   id={`${modelType}-model`}>
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
        id: configId,
        component: Content,
        getValue: (data) => {
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