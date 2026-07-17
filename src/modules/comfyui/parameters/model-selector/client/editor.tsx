import React from "react";
import {ComfyUIParameterProps} from "@/modules/comfyui/client/parameter-model";
import {Field, FieldLabel} from "@/components/ui/field";
import {modelTypes, parameterEntryName as engineName} from "@/modules/comfyui/models";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {useTranslations} from "next-intl";
import {ComfyUIModelCombobox} from "@/modules/comfyui/client/combobox";
import {Input} from "@/components/ui/input";

export interface Config {
    type: string;
    nodeId: string;
    nodeName: string;
    defaultValue: string;
}

export function EditorComponent({entry, formRef}: ComfyUIParameterProps) {
    const t = useTranslations();
    const config = entry.config as Config;
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
                <Select name="model_type"
                        value={type} onValueChange={setType}>
                    <SelectTrigger className="w-full"
                                   id={`${engineName}-model_type-${entry.id}`}>
                        <SelectValue/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            {modelTypes.map((e) =>
                                <SelectItem key={e} value={e}>
                                    {e}
                                </SelectItem>
                            )}
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </Field>
            <InputComponent entry={entry} formRef={formRef}/>
        </div>
    </>;
}

export function InputComponent({entry}: ComfyUIParameterProps) {
    const t = useTranslations();
    const config = entry.config as Config;
    return <>
        <Field>
            <FieldLabel htmlFor={`${engineName}-model-${entry.id}`}>
                {t("comfyui.model_type")}
            </FieldLabel>
            <ComfyUIModelCombobox id={`${engineName}-model-${entry.id}`}
                                  name={`model_${entry.id}`} type={config?.type}
                                  defaultValue={config?.defaultValue}/>
        </Field>
    </>;
}