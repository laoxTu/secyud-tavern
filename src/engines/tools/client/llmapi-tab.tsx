import {ToolboxIcon} from "lucide-react";
import React, {RefObject, useState} from "react";
import {del, post, put} from "@/client";
import {TabConfig} from "@/components/custom/tab";
import {TemplateEntryList} from "@/business/client/template";
import {EntryTabHeader} from "@/business/client/template/tab-header";
import {useItemState} from "@/modules/llmapis/client/models";
import {moduleName} from "@/modules/llmapis/models";
import {entryState, LlmapiToolProvider} from "./models";
import {engineName, LlmapiToolConfigModel} from "../models";
import {useTranslations} from "next-intl";
import {Field, FieldLabel} from "@/components/ui/field";
import {Selector} from "@/components/custom/selector";
import {llmapiToolManager} from "@/engines/tools/client/manager";

function EditorContent({entry}: { entry: LlmapiToolConfigModel, formRef: RefObject<HTMLFormElement | null> }) {
    const t = useTranslations();
    const [editor, setEditor] = useState<LlmapiToolProvider | null>(
        llmapiToolManager.records[entry.provider] ?? null);

    return (
        <>
            <div className="grid md:grid-cols-2 gap-4">
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
            </div>
            {editor?.component && (() => {
                const Component = editor.component;
                return <Component defaultValue={entry.value} entry={entry}/>
            })()}
        </>
    );
}

function Tab() {
    const {model} = useItemState();
    return (
        <TemplateEntryList<LlmapiToolConfigModel>
            entryState={entryState}
            modelId={model!.id}
            createProps={{
                createHandler: async (data) => {
                    await post('/llmapis/{id}/entries/{entryType}', {
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
                    await put('/llmapis/{id}/entries/{entryType}/{entryId}/disabled', {
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
                    await del('/llmapis/{id}/entries/{entryType}/{entryId}', {
                        params: {
                            id: model?.id,
                            entryType: engineName,
                            entryId: entry.id
                        }
                    })
                },
                cloneHandler: async (entry, data) => {
                    await post('/llmapis/{id}/entries/{entryType}', {
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
                    await put('/llmapis/{id}/entries/{entryType}/{entryId}', result, {
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