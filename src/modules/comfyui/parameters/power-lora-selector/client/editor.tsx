import React from "react";
import {ComfyUIParameterProps} from "@/modules/comfyui/client/parameter-model";
import {Field, FieldLabel} from "@/components/ui/field";
import {ComfyUIModelModel, parameterEntryName as engineName} from "@/modules/comfyui/models";
import {useTranslations} from "next-intl";
import {Input} from "@/components/ui/input";
import {Checkbox} from "@/components/ui/checkbox";
import {PowerLoraSelectorConfig} from "../model";
import {RemoteSearchCombobox} from "@/components/custom/combobox";
import {ComfyUIHoverableItem} from "@/modules/comfyui/client/components";
import {get} from "@/client";
import {PagedResult} from "@/business/models";
import {useErrorHandler} from "@/handler/client/error";


export function EditorComponent({entry, formRef}: ComfyUIParameterProps) {
    const t = useTranslations();
    const config = entry.config as PowerLoraSelectorConfig;
    return <>
        <div className="grid md:grid-cols-2 gap-4">
            <Field>
                <FieldLabel htmlFor={`${engineName}-node_id-${entry.id}`}>
                    {t("comfyui.node_id")}
                </FieldLabel>
                <Input name={"node_id"} defaultValue={config?.nodeId}
                       id={`${engineName}-node_id-${entry.id}`}/>
            </Field>
        </div>
        <InputComponent entry={entry} formRef={formRef}/>
    </>;
}

export function InputComponent({entry}: ComfyUIParameterProps) {
    const t = useTranslations();
    const config = entry.config as PowerLoraSelectorConfig;
    const [count, setCount] = React.useState(config?.defaultValue?.length ?? 0);
    const {handleError} = useErrorHandler();

    return <>
        <Field>
            <FieldLabel htmlFor={`${engineName}-count-${entry.id}`}>
                {`${entry.name} ${t("comfyui.lora_count")}`}
            </FieldLabel>
            <Input name={`count_${entry.id}`} type={"number"}
                   value={count}
                   onChange={u => setCount(parseInt(u.target.value))}
                   min={0} max={10} step={1}
                   id={`${engineName}-count-${entry.id}`}/>
        </Field>

        {Array.from({length: count}, (_, index) => {
            const lora = (config?.defaultValue?.length ?? 0) > index ?
                config.defaultValue[index] : null;
            const path = lora?.lora;
            return (
                <div key={index} className="grid md:grid-cols-2 gap-4">
                    <Field key={`${index}-lora`}>
                        <FieldLabel htmlFor={`${engineName}-lora-${entry.id}-${index}`}>
                            {`${entry.name} ${t("comfyui.lora")} ${index + 1}`}
                            <Checkbox name={`lora_on_${entry.id}_${index}`}
                                      defaultChecked={lora?.on ?? true}/>
                        </FieldLabel>

                        <RemoteSearchCombobox
                            name={`lora_${entry.id}_${index}`} id={`${engineName}-lora-${entry.id}-${index}`}
                            defaultValue={path ? {
                                id: "",
                                type: "",
                                entries: [],
                                code: path, name: path,
                                content: {
                                    path: path,
                                },
                            } : null}
                            comparer={(u, v) => u.content?.path === v.content?.path}
                            labelAccessor={e => `${e.content.baseModel}-${e.code}`}
                            valueAccessor={e => e.content.path}
                            customItemRender={u => (<ComfyUIHoverableItem item={u}/>)}
                            searchHandler={async (search: string | null) => {
                                try {
                                    const res = await get("/comfyuis/models", {
                                        params: {
                                            search: {
                                                fuzzy: search,
                                                types: ['lora'],
                                            },
                                        }
                                    }) as PagedResult<ComfyUIModelModel>;
                                    return res.data;
                                } catch (e) {
                                    handleError(e);
                                }
                            }}/>
                    </Field>
                    <Field key={`${index}-strength`}>
                        <FieldLabel htmlFor={`${engineName}-lora_strength-${entry.id}-${index}`}>
                            {`${t("comfyui.strength")} ${index + 1}`}
                        </FieldLabel>
                        <Input name={`lora_strength_${entry.id}_${index}`} type={"number"}
                               defaultValue={lora?.strength ?? 1}
                               min={-10} max={10} step={0.05}
                               id={`${engineName}-lora_strength-${entry.id}-${index}`}/>
                    </Field>
                </div>
            );
        })}
    </>;
}