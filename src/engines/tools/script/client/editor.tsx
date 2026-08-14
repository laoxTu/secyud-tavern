'use client';
import {useTranslations} from 'next-intl';
import {mergeObjects} from "@/utils";
import {LlmapiToolProps} from "@/engines/tools/client/models";
import {Field, FieldLabel} from "@/components/ui/field";
import {ScriptToolConfigModel} from "@/engines/tools/script/models";
import {Textarea} from "@/components/ui/textarea";
import {submitTargetFormOnKey} from "@/business/client";
import React from "react";
import {MonacoEditor} from "@/components/custom/monaco-editor";

const defaultConfig: ScriptToolConfigModel = {
    description: "",
    script: "return input;",
    schema: "{}",
};

export function Editor({defaultValue, entry, formRef}: LlmapiToolProps) {
    const t = useTranslations();
    const config: ScriptToolConfigModel = mergeObjects(defaultConfig, defaultValue);

    return (<>
        <Field>
            <FieldLabel htmlFor={`${entry.id}-description`}>
                {t('default.description')}
            </FieldLabel>
            <Textarea name="description"
                      id={`${entry.id}-description`}
                      defaultValue={config.description}
                      onKeyDown={submitTargetFormOnKey}/>
        </Field>
        <div className="grid md:grid-cols-2 gap-4">

            <Field>
                <FieldLabel htmlFor={`${entry.id}-script`}>
                    {t('default.script')}
                </FieldLabel>
                <MonacoEditor name={"script"}
                              defaultValue={config.script}
                              language={"javascript"}
                              formRef={formRef}
                />
            </Field>
            <Field>
                <FieldLabel htmlFor={`${entry.id}-schema`}>
                    {t('default.schema')}
                </FieldLabel>
                <MonacoEditor name={"schema"}
                              defaultValue={config.schema}
                              language={"json"}
                              formRef={formRef}
                />
            </Field>
        </div>
    </>);
}