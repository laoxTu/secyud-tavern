import React from "react";
import {ComfyUIParameterProps} from "@/modules/comfyui/client/parameter-model";
import {Field, FieldLabel} from "@/components/ui/field";
import {parameterEntryName as engineName} from "@/modules/comfyui/models";
import {useTranslations} from "next-intl";
import {Input} from "@/components/ui/input";
import {SelectorConfig} from "../model";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";


export function EditorComponent({entry}: ComfyUIParameterProps) {
    const t = useTranslations();
    const config = entry.config as SelectorConfig;

    const [count, setCount] = React.useState(config?.defaultValue.length ?? 1);
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
                <FieldLabel htmlFor={`${engineName}-count-${entry.id}`}>
                    {t("comfyui.lora_count")}
                </FieldLabel>
                <Input name={`value_count`} type={"number"}
                       value={count}
                       onChange={u => setCount(parseInt(u.target.value))}
                       min={1} step={1}
                       id={`${engineName}-count-${entry.id}`}/>
            </Field>
            {Array.from({length: count}, (_, index) => {
                const value = (config?.items.length ?? 0) > index ?
                    config.items[index] : null;
                return (
                    <Field key={index}>
                        <FieldLabel htmlFor={`${engineName}-value-${entry.id}-${index}`}>
                            {`${t("comfyui.value")} ${index + 1}`}
                        </FieldLabel>
                        <Input name={`value_${index}`} defaultValue={value ?? ""}
                               id={`${engineName}-value-${entry.id}-${index}`}/>
                    </Field>
                );
            })}
            <Field>
                <FieldLabel htmlFor={`${engineName}-value-${entry.id}-default`}>
                    {t("comfyui.default_value")}
                </FieldLabel>
                <Input name={`value_default`} defaultValue={config.defaultValue ?? ""}
                       id={`${engineName}-value-${entry.id}-default`}/>
            </Field>
        </div>
    </>;
}

export function InputComponent({entry}: ComfyUIParameterProps) {
    const config = entry.config as SelectorConfig;
    return <>
        <Field>
            <FieldLabel htmlFor={`${engineName}-value-${entry.id}`}>
                {entry.name}
            </FieldLabel>
            <Select name={`value_${entry.id}`} defaultValue={config.defaultValue}>
                <SelectTrigger className="w-full" id={`${engineName}-value-${entry.id}`}>
                    <SelectValue/>
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        {config.items.map((item, index) => (
                            <SelectItem key={index} value={item}>
                                {item}
                            </SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>
        </Field>
    </>;
}