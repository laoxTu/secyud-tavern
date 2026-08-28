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
        <Field>
            <FieldLabel htmlFor={`${engineName}-node_id-${entry.entryId}`}>
                {t("comfyui.node_id")}
            </FieldLabel>
            <Input name={"node_id"} defaultValue={config?.nodeId}
                   id={`${engineName}-node_id-${entry.entryId}`}/>
        </Field>
        <Field>
            <FieldLabel htmlFor={`${engineName}-node_name-${entry.entryId}`}>
                {t("comfyui.node_name")}
            </FieldLabel>
            <Input name={"node_name"} defaultValue={config?.nodeName}
                   id={`${engineName}-node_name-${entry.entryId}`}/>
        </Field>
        <InputComponent entry={entry} formRef={formRef}/>
    </>;
}

export function InputComponent({entry}: ComfyUIParameterProps) {
    const config = entry.config as NumberEditorConfig;
    const [value, setValue] = React.useState(config?.defaultValue ?? 0);
    return <>
        <Field>
            <FieldLabel htmlFor={`${engineName}-number-${entry.entryId}`}>
                {entry.name}
                <Button variant={"ghost"} size={'icon'}
                        onClick={() => {
                            setValue(Math.floor(Math.random() * 4294967296));
                        }}>
                    <DicesIcon/>
                </Button>
            </FieldLabel>
            <Input id={`${engineName}-number-${entry.entryId}`}
                   name={`number_${entry.entryId}`}
                   type="number"
                   value={value}
                   onChange={(e) => {
                       setValue(parseInt(e.target.value));
                   }}/>
        </Field>
    </>;
}