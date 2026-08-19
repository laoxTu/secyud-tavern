import {ToolboxIcon} from "lucide-react";
import React, {RefObject, useState} from "react";
import {del, get, post, put} from "@/client";
import {TabConfig} from "@/components/custom/tab";
import {EntryList} from "@/business/client/template/entry-list";
import {EntryTabHeader} from "@/business/client/template/tab-header";
import {useItemState} from "@/modules/presets/client/models";
import {moduleName, modulePlural} from "@/modules/presets/models";
import {engineName, LlmapiToolConfigModel} from "../models";
import {llmapiToolManager} from "@/engines/tools/client/manager";
import {createUsePagedItemsState} from "@/components/custom/pager";
import {EntryState} from "@/business/client/models";
import {useTranslations} from "next-intl";
import {LlmapiToolProvider} from "@/engines/tools/client/models";
import {Field, FieldLabel} from "@/components/ui/field";
import {Selector} from "@/components/custom/selector";
import {Input} from "@/components/ui/input";

export const usePagedItemsState = createUsePagedItemsState<LlmapiToolConfigModel>(
    async options => {
        return await get('/presets/{id}/entries/{entryType}', {params: options})
    });

export const entryState: EntryState<LlmapiToolConfigModel> = {
    moduleName, modulePlural, usePagedItemsState, entryType: engineName
};


export function EditorContent({entry, formRef}: {
    entry: LlmapiToolConfigModel,
    formRef: RefObject<HTMLFormElement | null>
}) {
    const t = useTranslations();
    const [editor, setEditor] = useState<LlmapiToolProvider | null>(
        llmapiToolManager.records[entry.provider] ?? null);

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
                <FieldLabel htmlFor={`llmapi-tool_provider-${entry.id}`}>
                    {t("llmapi.tool_provider")}
                </FieldLabel>
                <Selector id={`llmapi-tool_provider-${entry.id}`}
                          items={llmapiToolManager.getSorted()}
                          name={'provider'}
                          value={editor}
                          onValueChange={setEditor}
                          valueAccessor={u => u.id}
                          labelAccessor={(u) => t(`llmapi.tool_provider_${u.id}`)}/>
            </Field>
            {editor?.component && (() => {
                const Component = editor.component;
                return <Component defaultValue={entry.value} entry={entry} formRef={formRef}/>
            })()}
        </>
    );
}

function Tab() {
    const {model} = useItemState();
    return (
        <EntryList<LlmapiToolConfigModel>
            entryState={entryState}
            modelId={model!.id}
            createProps={{
                createHandler: async (data) => {
                    await post('/presets/{id}/entries/{entryType}', {
                        code: data.get('code'),
                        name: data.get('name'),
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
                    await put('/presets/{id}/entries/{entryType}/{entryId}/disabled', {
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
                    await del('/presets/{id}/entries/{entryType}/{entryId}', {
                        params: {
                            id: model?.id,
                            entryType: engineName,
                            entryId: entry.id
                        }
                    })
                },
                cloneHandler: async (entry, data) => {
                    await post('/presets/{id}/entries/{entryType}', {
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
                    const provider = data.get('provider') as string;

                    const result: LlmapiToolConfigModel = {
                        ...entry,
                        code: data.get('code') as string,
                        name: data.get('name') as string,
                        provider: provider,
                        value: llmapiToolManager.records[provider]?.getValue(data),
                    };
                    await put('/presets/{id}/entries/{entryType}/{entryId}', result, {
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
    label: () => <EntryTabHeader space={moduleName} value={engineName} icon={ToolboxIcon}/>,
    component: Tab
}