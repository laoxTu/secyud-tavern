import React, {useState} from "react";
import {FileCode2Icon} from "lucide-react";
import {useTranslations} from "next-intl";
import {Field, FieldLabel} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {TabConfig} from "@/components/custom/tab";
import {EntryList} from "@/business/client/template/entry-list";
import {del, post, put} from "@/client";
import {EntryTabHeader} from "@/business/client/template/tab-header";
import {ComfyUIParameterModel, moduleName, parameterEntryName as engineName} from "@/modules/comfyui/models";
import {comfyUIParameterRegistry} from "@/modules/comfyui/client/parameter";
import {ComfyUIParameter, ComfyUIParameterProps} from "@/modules/comfyui/client/parameter-model";
import {parameterEntryState, useItemState} from "@/modules/comfyui/client/models";
import {Selector} from "@/components/custom/selector";

function EditorContent({entry, formRef}: ComfyUIParameterProps) {
    const t = useTranslations();
    const [editor, setEditor] = useState<ComfyUIParameter | null>(
        comfyUIParameterRegistry.records[entry.type] ?? null);

    return (
        <>
            <Field>
                <FieldLabel htmlFor={`${engineName}-code-${entry.id}`}>
                    {t("default.code")}
                </FieldLabel>
                <Input name="code"
                       id={`${engineName}-code-${entry.id}`}
                       defaultValue={entry.code ?? ""}/>
            </Field>
            <Field>
                <FieldLabel htmlFor={`${engineName}-name-${entry.id}`}>
                    {t("default.name")}
                </FieldLabel>
                <Input name="name"
                       id={`${engineName}-name-${entry.id}`}
                       defaultValue={entry.name ?? ""}/>
            </Field>
            <Field>
                <FieldLabel htmlFor={`${engineName}-priority-${entry.id}`}>
                    {t("default.priority")}
                </FieldLabel>
                <Input name="priority" type={"number"}
                       id={`${engineName}-priority-${entry.id}`}
                       defaultValue={entry.priority}/>
            </Field>
            <Field>
                <FieldLabel htmlFor={`${engineName}-type-${entry.id}`}>
                    {t("comfyui.parameter_type")}
                </FieldLabel>
                <Selector id={`${engineName}-type-${entry.id}`}
                          items={comfyUIParameterRegistry.getSorted()}
                          name={'type'}
                          value={editor}
                          onValueChange={setEditor}
                          labelAccessor={e => t(`comfyui.parameter_type_${e.id}`)}
                          valueAccessor={e => e.id}/>
            </Field>
            {editor?.editorComponent && (() => {
                const Component = editor.editorComponent;
                return <Component formRef={formRef} entry={entry}/>
            })()}
        </>
    );
}

function Tab() {
    const editors = comfyUIParameterRegistry.records;
    const {model} = useItemState();
    return (
        <EntryList<ComfyUIParameterModel>
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