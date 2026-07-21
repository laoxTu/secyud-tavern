import React from "react";
import {FileCode2Icon} from "lucide-react";
import {useTranslations} from "next-intl";
import {Field, FieldLabel} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {TabConfig} from "@/components/custom/tab";
import {TemplateEntryList} from "@/business/client/template";
import {del, post, put} from "@/client";
import {EntryTabHeader} from "@/business/client/template/tab-header";
import {ComfyUIParameterModel, moduleName, parameterEntryName as engineName} from "@/modules/comfyui/models";
import {comfyUIParameterRegistry} from "@/modules/comfyui/client/parameter";
import {ComfyUIParameterProps} from "@/modules/comfyui/client/parameter-model";
import {parameterEntryState, useItemState} from "@/modules/comfyui/client/models";
import {EditorSelectorField} from "@/components/custom/editor-selector";

function EditorContent({entry, formRef}: ComfyUIParameterProps) {
    const t = useTranslations();

    return (
        <>
            <div className="grid md:grid-cols-2 gap-4">
                <Field>
                    <FieldLabel htmlFor={`${engineName}-priority-${entry.id}`}>
                        {t("default.priority")}
                    </FieldLabel>
                    <Input name="priority" type={"number"}
                           id={`${engineName}-priority-${entry.id}`}
                           defaultValue={entry.priority}/>
                </Field>
            </div>
            <EditorSelectorField id={`${engineName}-type-${entry.id}`}
                                 name="type"
                                 defaultValue={entry.type}
                                 fieldLabel={t("comfyui.parameter_type")}
                                 registry={comfyUIParameterRegistry}
                                 nameAccessor={e => t(`comfyui.parameter_type_${e.id}`)}
                                 valueAccessor={e => e.id}
                                 editorProps={{formRef, entry}}/>
        </>
    );
}

function Tab() {
    const editors = comfyUIParameterRegistry.records;
    const {model} = useItemState();
    return (
        <TemplateEntryList<ComfyUIParameterModel>
            entryState={parameterEntryState}
            modelId={model!.id}
            createProps={{
                createHandler: async (data) => {
                    await post('/comfyuis/workflows/{id}/entries/{entryType}', {
                        code: data.get('code'),
                        name: data.get('name'),
                        priority: 100,
                    }, {
                        params: {
                            id: model?.id,
                            entryType: engineName,
                        }
                    })
                }
            }}
            updateProps={{
                disableHandler: async (entry, disabled) => {
                    await put('/comfyuis/workflows/{id}/entries/{entryType}/{entryId}/disabled', {
                        disabled,
                    }, {
                        params: {
                            id: model?.id,
                            entryType: engineName,
                            entryId: entry.id
                        }
                    })
                    return {...entry, disabled};
                },
                deleteHandler: async entry => {
                    await del('/comfyuis/workflows/{id}/entries/{entryType}/{entryId}', {
                        params: {
                            id: model?.id,
                            entryType: engineName,
                            entryId: entry.id
                        }
                    })
                },
                cloneHandler: async (entry, data) => {
                    await post('/comfyuis/workflows/{id}/entries/{entryType}', {
                        ...entry,
                        code: data.get('code'),
                        name: data.get('name'),
                    }, {
                        params: {
                            id: model?.id,
                            entryType: engineName,
                        }
                    })
                },
                updateHandler: async (entry, data) => {
                    const type = data.get("type") as string;
                    const result: ComfyUIParameterModel = {
                        ...entry,
                        type: type,
                        config: editors[type].getEditorValue({data, entry, model: model!}),
                        priority: parseInt(data.get("priority") as string),
                        code: data.get('code') as string,
                        name: data.get('name') as string,
                    };
                    await put('/comfyuis/workflows/{id}/entries/{entryType}/{entryId}', result, {
                        params: {
                            id: model?.id,
                            entryType: engineName,
                            entryId: entry.id
                        }
                    });
                    return result;
                },
                updateContent: (entry, formRef) =>
                    (<EditorContent entry={entry} formRef={formRef}/>)
            }}/>
    );
}

export const tabConfig: TabConfig = {
    id: engineName,
    label: () => <EntryTabHeader space={moduleName} value={engineName} icon={FileCode2Icon}/>,
    component: Tab
}