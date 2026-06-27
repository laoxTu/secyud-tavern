'use client';
import {Field, FieldContent, FieldLabel} from "@/components/ui/field";
import React from "react";
import {useTranslations} from "next-intl";
import {Input} from "@/components/ui/input";
import {moduleName} from "@/llmapis/models";
import {LlmapiConfig} from "@/llmapis/client/config-models";
import {OpenAIConfigModel, engineName} from "../models";
import {mergeObjects} from "@/utils";
import {Checkbox} from "@/components/ui/checkbox";
import {Textarea} from "@/components/ui/textarea";
import {useItemState} from "@/llmapis/client/models";

const defaultConfig: OpenAIConfigModel = {
    url: "",
    extras: {},
    parameters: {
        model: "",
        stream: true,
        temperature: 1,
        top_p: 1,
        presence_penalty: 0,
        frequency_penalty: 0,
        max_tokens: 0
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
                <Field>
                    <FieldLabel htmlFor={`${moduleName}-max_tokens`}>
                        {t(`${moduleName}.max_tokens`)}
                    </FieldLabel>
                    <Input id={`${moduleName}-max_tokens`} name={"max_tokens"}
                           type={"number"} min={0} step={1}
                           defaultValue={config.parameters.max_tokens}/>
                </Field>
            </div>
            <Field>
                <FieldLabel htmlFor={`${moduleName}-extras`}>
                    {t(`${moduleName}.extras`)}
                </FieldLabel>
                <Textarea id={`${moduleName}-extras`} name={"extras"}
                          defaultValue={JSON.stringify(config.extras)}/>
            </Field>
        </>
    );
}

export const config: LlmapiConfig =
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
                    stream: Boolean(data.get('stream') as string),
                    temperature: Number(data.get('temperature') as string),
                    top_p: Number(data.get('top_p') as string),
                    presence_penalty: Number(data.get('presence_penalty') as string),
                    frequency_penalty: Number(data.get('frequency_penalty') as string),
                    max_tokens: Math.trunc(Number(data.get('max_tokens') as string)),
                },
                url: data.get('url') as string,
                extras: extras,
            };
        }
    } as const;