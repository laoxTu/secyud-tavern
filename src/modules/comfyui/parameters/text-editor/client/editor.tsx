import React from "react";
import {ComfyUIParameterProps} from "@/modules/comfyui/client/parameter-model";
import {Field, FieldLabel} from "@/components/ui/field";
import {parameterEntryName as engineName} from "@/modules/comfyui/models";
import {useTranslations} from "next-intl";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";

export interface Config {
    nodeId: string;
    nodeName: string;
    defaultValue: string;
}

export function EditorComponent({entry, formRef, workflow}: ComfyUIParameterProps) {
    const t = useTranslations();
    const config = entry.config as Config;
    return <>
        <div className="grid md:grid-cols-2 gap-4">
            <Field>
                <FieldLabel htmlFor={`${engineName}-node_id-${entry.id}`}>
                    {t("comfyui.node_id")}
                </FieldLabel>
                <Input name={"node_id"} defaultValue={config?.nodeId}
                       id={`${engineName}-node_id-${entry.id}`}/>
            </Field>
            <Field>
                <FieldLabel htmlFor={`${engineName}-node_name-${entry.id}`}>
                    {t("comfyui.node_name")}
                </FieldLabel>
                <Input name={"node_name"} defaultValue={config?.nodeName}
                       id={`${engineName}-node_name-${entry.id}`}/>
            </Field>
            <InputComponent entry={entry} formRef={formRef} workflow={workflow}/>
        </div>
    </>;
}

export function InputComponent({entry}: ComfyUIParameterProps) {
    const t = useTranslations();
    const config = entry.config as Config;
    return <>
        <Field>
            <FieldLabel htmlFor={`${engineName}-text-${entry.id}`}>
                {t("comfyui.text")}
            </FieldLabel>
            <Textarea id={`${engineName}-text-${entry.id}`}
                      name={`text_${entry.id}`}
                      defaultValue={config?.defaultValue}/>
        </Field>
    </>;
}