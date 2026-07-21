import React from "react";
import {ComfyUIParameterProps} from "@/modules/comfyui/client/parameter-model";
import {Field, FieldLabel} from "@/components/ui/field";
import {ComfyUIModelModel, modelTypes, parameterEntryName as engineName} from "@/modules/comfyui/models";
import {useTranslations} from "next-intl";
import {Input} from "@/components/ui/input";
import {ModelSelectorConfig} from "../model";
import {Selector} from "@/components/custom/selector";
import {RemoteSearchCombobox} from "@/components/custom/combobox";
import {get} from "@/client";
import {PagedResult} from "@/business/models";
import {useErrorHandler} from "@/handler/client/error";
import {ComfyUIHoverableItem} from "@/modules/comfyui/client/components";


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
                          items={modelTypes}/>
            </Field>
            <InputComponent entry={{
                ...entry, config: {
                    ...config,
                    type: type,
                }
            }} formRef={formRef}/>
        </div>
    </>;
}

export function InputComponent({entry}: ComfyUIParameterProps) {
    const config = entry.config as ModelSelectorConfig;
    const {handleError} = useErrorHandler();
    const path = config?.defaultValue;

    return <>
        <Field>
            <FieldLabel htmlFor={`${engineName}-model-${entry.id}`}>
                {entry.name}
            </FieldLabel>
            <RemoteSearchCombobox
                key={config.type ?? "model"}
                name={`model_${entry.id}`} id={`${engineName}-model-${entry.id}`}
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
                                    types: config.type ? [config.type] : [],
                                },
                            }
                        }) as PagedResult<ComfyUIModelModel>;
                        return res.data;
                    } catch (e) {
                        handleError(e);
                    }
                }}/>
        </Field>
    </>;
}