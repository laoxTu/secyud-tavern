import React, {RefObject, useState} from "react";
import {FileCode2Icon} from "lucide-react";
import {useTranslations} from "next-intl";
import {Field, FieldLabel} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {TabConfig} from "@/components/custom/tab";
import {moduleName} from "@/modules/presets/models";
import {matchName} from "../match/always/models";
import {TemplateEntryList} from "@/business/client/template";
import {del, post, put} from "@/client";
import {useItemState} from "@/modules/presets/client/models";
import {EntryTabHeader} from "@/business/client/template/tab-header";
import {lorebookMatcherRegistry} from "./match";
import {engineName, PresetLorebookModel} from "../models";
import {entryState} from "@/engines/lorebooks/client/models";
import {MonacoEditor} from "@/components/custom/monaco-editor";
import {EditorSelectorField, Selector} from "@/components/custom/editor-selector";

const roles = ["system", "user", "assistant"];
const contentTypes = ["json", "plaintext", "markdown", "yaml", "xml"];

function EditorContent({entry, formRef}: { entry: PresetLorebookModel, formRef: RefObject<HTMLFormElement | null> }) {
    const t = useTranslations();
    const [type, setType] = useState(entry.type ?? null);

    const language = (() => {
        if (type) return type;
        return "plaintext";
    })();

    return (
        <>
            <div className="grid md:grid-cols-2 gap-4">
                <Field>
                    <FieldLabel htmlFor={`${engineName}-priority-${entry.id}`}>
                        {t("default.priority")}
                    </FieldLabel>
                    <Input name="priority" type={"number"}
                           min={0} max={9999}
                           id={`${engineName}-priority-${entry.id}`}
                           defaultValue={entry.priority}/>
                </Field>
                <Field>
                    <FieldLabel htmlFor={`${engineName}-layer-${entry.id}`}>
                        {t("default.layer")}
                    </FieldLabel>
                    <Input name="layer" type={"number"}
                           id={`${engineName}-layer-${entry.id}`}
                           defaultValue={entry.layer}/>
                </Field>
                <Field>
                    <FieldLabel htmlFor={`lorebook-role-${entry.id}`}>
                        {t("lorebook.role")}
                    </FieldLabel>
                    <Selector name={'role'} id={`lorebook-role-${entry.id}`}
                              defaultValue={entry.role} items={roles}
                              nameAccessor={e => e}/>
                </Field>
                <Field>
                    <FieldLabel htmlFor={`${engineName}-type-${entry.id}`}>
                        {t("default.type")}
                    </FieldLabel>
                    <Selector name={'type'}
                              id={`${engineName}-type-${entry.id}`}
                              value={type}
                              onValueChange={setType}
                              items={contentTypes}
                              nameAccessor={e => e}/>
                </Field>
            </div>

            <EditorSelectorField registry={lorebookMatcherRegistry}
                                 fieldLabel={t(`lorebook.match_type`)}
                                 id={`lorebook-match_type-${entry.id}`}
                                 name={'matchType'}
                                 defaultValue={entry.matchType}
                                 editorProps={{defaultValue: entry.matchExpression, entry}}
                                 valueAccessor={u => u.id}
                                 nameAccessor={(u) => t(`lorebook.match_type_${u.id}`)}/>
            <Field>
                <FieldLabel>
                    {t("default.content")}
                </FieldLabel>
                <MonacoEditor name={'content'}
                              defaultValue={entry.content}
                              language={language} formRef={formRef}/>
            </Field>
        </>
    );
}

function Tab() {
    const matchEditors = lorebookMatcherRegistry.records;
    const {model} = useItemState();
    return (
        <TemplateEntryList<PresetLorebookModel>
            entryState={entryState}
            modelId={model!.id}
            createProps={{
                createHandler: async (data) => {
                    await post('/presets/{id}/entries/{entryType}', {
                        code: data.get('code'),
                        name: data.get('name'),
                        matchType: matchName,
                        matchExpression: [],
                        content: "",
                        priority: 100,
                        layer: 100,
                        role: 'user'
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
                    const matchType = data.get("matchType") as string;
                    const result = {
                        ...entry,
                        matchType: matchType,
                        matchExpression: matchEditors[matchType]?.getValue(data),
                        content: data.get("content") as string,
                        type: data.get("type") as string,
                        priority: parseInt(data.get("priority") as string),
                        layer: parseInt(data.get("layer") as string),
                        role: data.get("role") as string,
                        code: data.get('code') as string,
                        name: data.get('name') as string,
                    }
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
    label: () => <EntryTabHeader space={moduleName} value={engineName} icon={FileCode2Icon}/>,
    component: Tab
}