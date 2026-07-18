import React from "react";
import {ComfyUIParameterProps} from "@/modules/comfyui/client/parameter-model";
import {Field, FieldLabel} from "@/components/ui/field";
import {parameterEntryName as engineName} from "@/modules/comfyui/models";
import {useTranslations} from "next-intl";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {DicesIcon} from "lucide-react";
import {NumberEditorConfig} from "../model";


export function EditorComponent({entry, formRef}: ComfyUIParameterProps) {
    const t = useTranslations();
    const config = entry.config as NumberEditorConfig;
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
            <InputComponent entry={entry} formRef={formRef}/>
        </div>
    </>;
}

export function InputComponent({entry}: ComfyUIParameterProps) {
    const t = useTranslations();
    const config = entry.config as NumberEditorConfig;
    const [value, setValue] = React.useState(config?.defaultValue ?? 0);
    return <>
        <Field>
            <FieldLabel htmlFor={`${engineName}-number-${entry.id}`}>
                {t("comfyui.number")}
                <Button variant={"ghost"} size={'icon'}
                        onClick={() => {
                    setValue(Math.floor(Math.random() * 4294967296));
                }}>
                    <DicesIcon/>
                </Button>
            </FieldLabel>
            <Input id={`${engineName}-number-${entry.id}`}
                   name={`number_${entry.id}`}
                   type="number"
                   value={value}
                   onChange={(e) => {
                       setValue(parseInt(e.target.value));
                   }}/>
        </Field>
    </>;
}