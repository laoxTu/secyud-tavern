import React from "react";
import {ComfyUIParameterProps} from "@/modules/comfyui/client/parameter-model";
import {Field, FieldLabel} from "@/components/ui/field";
import {modelTypes, parameterEntryName as engineName} from "@/modules/comfyui/models";
import {useTranslations} from "next-intl";
import {ComfyUIModelCombobox} from "@/modules/comfyui/client/combobox";
import {Input} from "@/components/ui/input";
import {ModelSelectorConfig} from "../model";
import {Selector} from "@/components/custom/editor-selector";


export function EditorComponent({entry, formRef}: ComfyUIParameterProps) {
    const t = useTranslations();
    const config = entry.config as ModelSelectorConfig;
    const [type, setType] = React.useState<string | null>(config?.type ?? null);
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
            <Field>
                <FieldLabel htmlFor={`${engineName}-model_type-${entry.id}`}>
                    {t("comfyui.model_type")}
                </FieldLabel>
                <Selector name={'model_type'}
                          id={`${engineName}-model_type-${entry.id}`}
                          value={type} onValueChange={setType}
                          items={modelTypes}
                          nameAccessor={e => e}/>
            </Field>
            <InputComponent entry={entry} formRef={formRef}/>
        </div>
    </>;
}

export function InputComponent({entry}: ComfyUIParameterProps) {
    const config = entry.config as ModelSelectorConfig;
    return <>
        <Field>
            <FieldLabel htmlFor={`${engineName}-model-${entry.id}`}>
                {entry.name}
            </FieldLabel>
            <ComfyUIModelCombobox id={`${engineName}-model-${entry.id}`}
                                  name={`model_${entry.id}`} type={config?.type}
                                  defaultValue={config?.defaultValue}/>
        </Field>
    </>;
}