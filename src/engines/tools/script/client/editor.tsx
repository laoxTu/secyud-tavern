'use client';
import {useTranslations} from 'next-intl';
import {mergeObjects} from "@/utils";
import {LlmapiToolProps} from "@/engines/tools/client/models";
import {Field, FieldContent, FieldLabel} from "@/components/ui/field";
import {ScriptToolConfigModel} from "@/engines/tools/script/models";
import {Textarea} from "@/components/ui/textarea";
import {submitTargetFormOnKey} from "@/business/client";
import React from "react";
import {MonacoEditor} from "@/components/custom/monaco-editor";
import {Checkbox} from "@/components/ui/checkbox";
import {rowFull, rowQuat, spanHalf} from "@/components/custom/grid-field";
import {cn} from "@/lib/utils";

const defaultConfig: ScriptToolConfigModel = {
    description: "",
    script: "return input;",
    hidden: false,
    enableDoc: false,
    schema: `
{
    "type": "object",
    "additionalProperties": false
}`,
};

export function Editor({defaultValue, entry, formRef}: LlmapiToolProps) {
    const t = useTranslations();
    const config: ScriptToolConfigModel = mergeObjects(defaultConfig, defaultValue);

    return (<>
        <Field className={cn(spanHalf, rowQuat)}>
            <FieldLabel htmlFor={`${entry.id}-description`}>
                {t('default.description')}
            </FieldLabel>
            <Textarea name="description"
                      id={`${entry.id}-description`}
                      defaultValue={config.description}
                      onKeyDown={submitTargetFormOnKey}/>
        </Field>
        <Field>
            <FieldLabel htmlFor={`${entry.id}-hidden`}>
                {t('default.hidden')}
            </FieldLabel>
            <FieldContent>
                <Checkbox name="hidden"
                          id={`${entry.id}-hidden`}
                          defaultChecked={config.hidden}/>
            </FieldContent>
        </Field>
        <Field>
            <FieldLabel htmlFor={`${entry.id}-enable_doc`}>
                {t('script.enable_doc')}
            </FieldLabel>
            <FieldContent>
                <Checkbox name="enable_doc"
                          id={`${entry.id}-enable_doc`}
                          defaultChecked={config.enableDoc ?? false}/>
            </FieldContent>
        </Field>
        <Field>
            <FieldLabel htmlFor={`${entry.id}-enable_variable`}>
                {t('script.enable_variable')}
            </FieldLabel>
            <FieldContent>
                <Checkbox name="enable_variable"
                          id={`${entry.id}-enable_variable`}
                          defaultChecked={config.enableVariable ?? false}/>
            </FieldContent>
        </Field>
        <Field className={cn(spanHalf, rowFull)}>
            <FieldLabel htmlFor={`${entry.id}-script`}>
                {t('default.script')}
            </FieldLabel>
            <MonacoEditor name={"script"}
                          defaultValue={config.script}
                          language={"javascript"}
                          formRef={formRef}
            />
        </Field>
        <Field className={cn(spanHalf, rowFull)}>
            <FieldLabel htmlFor={`${entry.id}-schema`}>
                {t('default.schema')}
            </FieldLabel>
            <MonacoEditor name={"schema"}
                          defaultValue={config.schema}
                          language={"json"}
                          formRef={formRef}
            />
        </Field>
    </>);
}