'use client';

import {useTranslations} from 'next-intl';
import {mergeObjects} from "@/utils";
import {LlmapiToolProps} from "@/engines/tools/client/models";
import {Field, FieldContent, FieldLabel} from "@/components/ui/field";
import {SubAgentConfigModel} from "@/engines/tools/sub-agent/models";
import {Textarea} from "@/components/ui/textarea";
import {TagBox} from "@/components/custom/combobox";
import {rowFull, rowQuat, spanHalf} from "@/components/custom/grid-field";
import {Checkbox} from "@/components/ui/checkbox";
import {Input} from "@/components/ui/input";
import {submitTargetFormOnKey} from "@/business/client";
import {LlmapiRequireField} from "@/modules/llmapis/client/tabs";
import {parameterEntryName as engineName} from "@/modules/comfyui/models";
import React from "react";
import {PresetRequiresField} from "@/modules/presets/client/tabs";
import {MonacoEditor} from "@/components/custom/monaco-editor";
import {cn} from "@/lib/utils";

const defaultConfig: SubAgentConfigModel = {
    disablePreset: false, maxLength: 0,
    description: "",
    disableTags: [],
    llmapi: null,
    presets: [],
    schema: `{
    "type": "object",
    "additionalProperties": false
}`,
};

export function Editor({defaultValue, entry, formRef}: LlmapiToolProps) {
    const t = useTranslations();
    const config: SubAgentConfigModel = mergeObjects(defaultConfig, defaultValue);

    return (
        <>
            <Field className={cn(spanHalf, rowQuat)}>
                <FieldLabel htmlFor={`${entry.id}-description`}>
                    {t('default.description')}
                </FieldLabel>
                <Textarea id={`${entry.id}-description`}
                          name={"description"}
                          defaultValue={config.description}
                          onKeyDown={submitTargetFormOnKey}/>
            </Field>
            <Field className={cn(spanHalf, rowFull)}>
                <FieldLabel htmlFor={`${entry.id}-schema`}>
                    {t('default.schema')}
                </FieldLabel>
                <MonacoEditor name={"schema"}
                              defaultValue={config.schema}
                              language={"json"}
                              formRef={formRef}/>
            </Field>
            <Field>
                <FieldLabel htmlFor={`${entry.id}-disable_preset`}>
                    {t('sub_agent.disable_preset')}
                </FieldLabel>
                <FieldContent>
                    <Checkbox id={`${entry.id}-disable_preset`} name={"disable_preset"}
                              defaultChecked={config.disablePreset}/>
                </FieldContent>
            </Field>
            <Field>
                <FieldLabel htmlFor={`${entry.id}-max_length`}>
                    {t('sub_agent.max_length')}
                </FieldLabel>
                <FieldContent>
                    <Input id={`${entry.id}-max_length`} name={"max_length"}
                           min={0} step={1}
                           defaultValue={config.maxLength}/>
                </FieldContent>
            </Field>
            <LlmapiRequireField defaultValue={config.llmapi ?? null}
                                prefix={`${engineName}-${entry.id}`}/>
            <PresetRequiresField defaultValue={config.presets ?? []}
                                 prefix={`${engineName}-${entry.id}`}/>
            <Field className={spanHalf}>
                <FieldLabel htmlFor={`${entry.id}-disable_tags`}>
                    {t('sub_agent.disable_tags')}
                </FieldLabel>
                <TagBox id={`${entry.id}-disable_tags`} name={"disable_tags"}
                        defaultValue={config.disableTags}/>
            </Field>
        </>
    );
}