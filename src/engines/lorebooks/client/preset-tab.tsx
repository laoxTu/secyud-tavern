'use client';
import React, {RefObject, useState} from "react";
import {FileCode2Icon} from "lucide-react";
import {useTranslations} from "next-intl";
import {Field, FieldLabel} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {TabConfig} from "@/components/custom/tab";
import {moduleName} from "@/modules/presets/models";
import {matchName} from "../match/always/models";
import {EntryList} from "@/business/client/template/entry-list";
import {del, post, put} from "@/client";
import {useItemState} from "@/modules/presets/client/models";
import {EntryTabHeader} from "@/business/client/template/tab-header";
import {lorebookMatcherRegistry} from "./match";
import {engineName, PresetLorebookModel} from "../models";
import {entryState} from "@/engines/lorebooks/client/models";
import {MonacoEditor} from "@/components/custom/monaco-editor";
import {Selector} from "@/components/custom/selector";
import {Matcher} from "@/engines/lorebooks/client/match-models";
import {rowFull, spanHalf} from "@/components/custom/grid-field";
import {BusinessError} from "@/handler/models";
import {checkJson} from "@/utils";
import {presetTabIsHide} from "@/modules/presets/client/tabs";
import {customCreateElement} from "@/components/custom";
import {cn} from "@/lib/utils";
import {DisableModel, EntryOperation} from "@/business/models";

const roles = ["system", "user", "assistant", "knowledge"];
const contentTypes = ["json", "plaintext", "markdown", "yaml", "xml"];

function EditorContent({entry, formRef}: { entry: PresetLorebookModel, formRef: RefObject<HTMLFormElement | null> }) {
    const t = useTranslations();
    const [type, setType] = useState(entry.type ?? null);
    const [editor, setEditor] = useState<Matcher | null>(
        lorebookMatcherRegistry.records[entry.matchType] ?? null);

    const language = (() => {
        if (type) return type;
        return "plaintext";
    })();

    return (
        <>
            <Field className={cn(spanHalf, rowFull)}>
                <FieldLabel>
                    {t("default.content")}
                </FieldLabel>
                <MonacoEditor name={'content'}
                              defaultValue={entry.content}
                              language={language} formRef={formRef}/>
            </Field>
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
                <FieldLabel htmlFor={`${engineName}-priority-${entry.entryId}`}>
                    {t("default.priority")}
                </FieldLabel>
                <Input name="priority" type={"number"}
                       min={0} max={9999}
                       id={`${engineName}-priority-${entry.entryId}`}
                       defaultValue={entry.priority}/>
            </Field>
            <Field>
                <FieldLabel htmlFor={`${engineName}-layer-${entry.entryId}`}>
                    {t("default.layer")}
                </FieldLabel>
                <Input name="layer" type={"number"}
                       id={`${engineName}-layer-${entry.entryId}`}
                       defaultValue={entry.layer}/>
            </Field>
            <Field>
                <FieldLabel htmlFor={`lorebook-role-${entry.entryId}`}>
                    {t("lorebook.role")}
                </FieldLabel>
                <Selector name={'role'}
                          id={`lorebook-role-${entry.entryId}`}
                          defaultValue={entry.role}
                          items={roles}/>
            </Field>
            <Field>
                <FieldLabel htmlFor={`${engineName}-type-${entry.entryId}`}>
                    {t("default.type")}
                </FieldLabel>
                <Selector name={'type'}
                          id={`${engineName}-type-${entry.entryId}`}
                          value={type}
                          onValueChange={setType}
                          items={contentTypes}/>
            </Field>
            <Field>
                <FieldLabel id={`lorebook-match_type-${entry.entryId}`}>
                    {t("lorebook.match_type")}
                </FieldLabel>
                <Selector id={`lorebook-match_type-${entry.entryId}`}
                          items={lorebookMatcherRegistry.getSorted()}
                          name={'matchType'}
                          value={editor}
                          onValueChange={setEditor}
                          valueAccessor={u => u.id}
                          labelAccessor={(u) => t(`lorebook.match_type_${u.id}`)}/>
            </Field>
            {customCreateElement(editor?.component,
                {defaultValue: entry.matchExpression, entry,})}
        </>
    );
}

function Tab() {
    const matchEditors = lorebookMatcherRegistry.records;
    const {model} = useItemState();
    return (
        <EntryList<PresetLorebookModel>
            entryState={entryState}
            modelId={model!.id}
            createProps={{
                createHandler: async (data) => {
                    await post<EntryOperation<PresetLorebookModel>>('/presets/{id}/entries/{entryType}', {
                        code: data.get('code') as string,
                        name: data.get('name') as string,
                        matchType: matchName,
                        matchExpression: [],
                        content: "",
                        priority: 100,
                        layer: 100,
                        role: 'knowledge',
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
                    await put<DisableModel>(
                        '/presets/{id}/entries/{entryType}/{entryId}/disabled', {
                        disabled,
                    }, {
                        params: {
                            id: model?.id,
                            entryType: engineName,
                            entryId: entry.entryId
                        }
                    })
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
                    await post<EntryOperation<PresetLorebookModel>>('/presets/{id}/entries/{entryType}', {
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
                    const matchType = data.get("matchType") as string;
                    const content = data.get("content") as string;
                    const type = data.get("type") as string;
                    if (type === "json") {
                        if (!checkJson(content))
                            throw new BusinessError("json is invalid",
                                "default.json_invalid")
                                .withValue("target", "preset.lorebook");
                    }
                    await put<EntryOperation<PresetLorebookModel>>('/presets/{id}/entries/{entryType}/{entryId}',
                        {
                            matchType, content, type,
                            matchExpression: matchEditors[matchType]?.getValue(data),
                            priority: parseInt(data.get("priority") as string),
                            layer: parseInt(data.get("layer") as string),
                            role: data.get("role") as any,
                            code: data.get('code') as string,
                            name: data.get('name') as string,
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
    label: () => <EntryTabHeader space={moduleName} value={engineName} icon={FileCode2Icon}/>,
    component: Tab
}