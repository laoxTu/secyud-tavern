import {ToolboxIcon} from "lucide-react";
import React, {RefObject, useState} from "react";
import {del, post, put} from "@/client";
import {TabConfig} from "@/components/custom/tab";
import {EntryList} from "@/business/client/template/entry-list";
import {EntryTabHeader} from "@/business/client/template/tab-header";
import {useItemState} from "@/modules/presets/client/models";
import {moduleName} from "@/modules/presets/models";
import {engineName, PresetToolConfigModel} from "../models";
import {llmapiToolManager} from "@/engines/tools/client/manager";
import {useTranslations} from "next-intl";
import {entryState, LlmapiToolProvider} from "@/engines/tools/client/models";
import {Field, FieldLabel} from "@/components/ui/field";
import {Selector} from "@/components/custom/selector";
import {Input} from "@/components/ui/input";
import {presetTabIsHide} from "@/modules/presets/client/tabs";
import {customCreateElement} from "@/components/custom";
import {DisableModel, EntryOperation} from "@/business/models";


export function EditorContent({entry, formRef}: {
    entry: PresetToolConfigModel,
    formRef: RefObject<HTMLFormElement | null>
}) {
    const t = useTranslations();
    const [editor, setEditor] = useState<LlmapiToolProvider | null>(
        llmapiToolManager.records[entry.provider] ?? null);

    return (
        <>
            <Field>
                <FieldLabel htmlFor={`${engineName}-code-${entry.entryId}`}>
                    {t("default.code")}
                </FieldLabel>
                <Input name="code"
                       id={`${engineName}-code-${entry.entryId}`}
                       defaultValue={entry.code ?? ""}/>
            </Field>
            <Field>
                <FieldLabel htmlFor={`${engineName}-name-${entry.entryId}`}>
                    {t("default.name")}
                </FieldLabel>
                <Input name="name"
                       id={`${engineName}-name-${entry.entryId}`}
                       defaultValue={entry.name ?? ""}/>
            </Field>
            <Field>
                <FieldLabel htmlFor={`llmapi-tool_provider-${entry.entryId}`}>
                    {t("llmapi.tool_provider")}
                </FieldLabel>
                <Selector id={`llmapi-tool_provider-${entry.entryId}`}
                          items={llmapiToolManager.getSorted()}
                          name={'provider'}
                          value={editor}
                          onValueChange={setEditor}
                          valueAccessor={u => u.id}
                          labelAccessor={(u) => t(`llmapi.tool_provider_${u.id}`)}/>
            </Field>
            {customCreateElement(editor?.component, {
                defaultValue: entry.value, entry, formRef,
            })}
        </>
    );
}

function Tab() {
    const {model} = useItemState();
    return (
        <EntryList<PresetToolConfigModel>
            entryState={entryState}
            modelId={model!.id}
            createProps={{
                createHandler: async (data) => {
                    await post<EntryOperation<PresetToolConfigModel>>('/presets/{id}/entries/{entryType}', {
                        code: data.get('code') as string,
                        name: data.get('name') as string,
                        provider: "",
                        value: {},
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
                    await put<DisableModel>('/presets/{id}/entries/{entryType}/{entryId}/disabled', {
                        disabled,
                    }, {
                        params: {
                            id: model?.id,
                            entryType: engineName,
                            entryId: entry.entryId
                        }
                    });
                },
                deleteHandler: async entry => {
                    await del('/presets/{id}/entries/{entryType}/{entryId}', {
                        params: {
                            id: model?.id,
                            entryType: engineName,
                            entryId: entry.entryId
                        }
                    })
                },
                cloneHandler: async (entry, data) => {
                    await post<EntryOperation<PresetToolConfigModel>>('/presets/{id}/entries/{entryType}', {
                        ...entry,
                        code: data.get('code') as string,
                        name: data.get('name') as string,
                    }, {
                        params: {
                            id: model?.id,
                            entryType: engineName,
                        }
                    })
                },
                updateHandler: async (entry, data) => {
                    const provider = data.get('provider') as string;

                    await put<EntryOperation<PresetToolConfigModel>>(
                        '/presets/{id}/entries/{entryType}/{entryId}',
                        {
                            ...entry,
                            code: data.get('code') as string,
                            name: data.get('name') as string,
                            provider: provider,
                            value: llmapiToolManager.records[provider]?.getValue(data),
                        },
                        {
                            params: {
                                id: model?.id,
                                entryType: engineName,
                                entryId: entry.entryId
                            }
                        });
                },
                updateContent: (entry, formRef) =>
                    (<EditorContent entry={entry} formRef={formRef}/>)
            }}/>
    );
}

export const tabConfig: TabConfig = {
    id: engineName,
    hide: async () => presetTabIsHide(engineName),
    label: () => <EntryTabHeader space={moduleName} value={engineName} icon={ToolboxIcon}/>,
    component: Tab
}