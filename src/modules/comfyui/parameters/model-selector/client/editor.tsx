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
import {spanHalf} from "@/components/custom/grid-field";


export function EditorComponent({entry, formRef}: ComfyUIParameterProps) {
    const t = useTranslations();
    const config = entry.config as ModelSelectorConfig;
    const [type, setType] = React.useState<string | null>(config?.type ?? null);
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
        <Field>
            <FieldLabel htmlFor={`${engineName}-model_type-${entry.entryId}`}>
                {t("comfyui.model_type")}
            </FieldLabel>
            <Selector name={'model_type'}
                      id={`${engineName}-model_type-${entry.entryId}`}
                      value={type} onValueChange={setType}
                      items={modelTypes}/>
        </Field>
        <InputComponent entry={{
            ...entry, config: {
                ...config,
                type: type,
            }
        }} formRef={formRef}/>
    </>;
}

export function InputComponent({entry}: ComfyUIParameterProps) {
    const config = entry.config as ModelSelectorConfig;
    const {handleError} = useErrorHandler();
    const path = config?.defaultValue;

    return <>
        <Field className={spanHalf}>
            <FieldLabel htmlFor={`${engineName}-model-${entry.entryId}`}>
                {entry.name}
            </FieldLabel>
            <RemoteSearchCombobox
                key={config.type ?? "model"}
                name={`model_${entry.entryId}`} id={`${engineName}-model-${entry.entryId}`}
                defaultValue={path ? {
                    id: "",
                    type: "",
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