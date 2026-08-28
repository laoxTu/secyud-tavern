import {Code2Icon} from "lucide-react";
import React, {RefObject, useState} from "react";
import {useTranslations} from "next-intl";
import {del, post, put} from "@/client";
import {Field, FieldLabel} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {TabConfig} from "@/components/custom/tab";
import {EntryList} from "@/business/client/template/entry-list";
import {EntryTabHeader} from "@/business/client/template/tab-header";
import {useItemState} from "@/modules/presets/client/models";
import {moduleName} from "@/modules/presets/models";
import {entryState} from "./models";
import {engineName, PresetScriptModel} from "../models";
import {MonacoEditor} from "@/components/custom/monaco-editor";
import {Selector} from "@/components/custom/selector";
import {spanHalf} from "@/components/custom/grid-field";
import {presetTabIsHide} from "@/modules/presets/client/tabs";
import {EntryOperation} from "@/business/models";

const scriptTypes = ["", "link", "application/javascript", "module", "importmap"];

function Editor({entry, formRef}: { entry: PresetScriptModel, formRef: RefObject<HTMLFormElement | null> }) {
    const t = useTranslations();
    const [type, setType] = useState(entry.type ?? null);

    const language = (() => {
        switch (type) {
            case "link":
                return "plaintext";
            case "importmap":
                return "json";
            default:
                return "javascript";
        }
    })();

    return (<>
        <Field className={spanHalf + " row-span-8"}>
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
                   id={`${engineName}-priority-${entry.entryId}`}
                   defaultValue={entry.priority}/>
        </Field>
        <Field>
            <FieldLabel htmlFor={`${engineName}-type-${entry.entryId}`}>
                {t("default.type")}
            </FieldLabel>

            <Selector name={'type'} id={`${engineName}-type-${entry.entryId}`}
                      value={type} onValueChange={setType}
                      items={scriptTypes}/>
        </Field>
    </>);
}

function Tab() {
    const {model} = useItemState();
    return (
        <EntryList<PresetScriptModel>
            entryState={entryState}
            modelId={model!.id}
            createProps={{
                createHandler: async (data) => {
                    await post<EntryOperation<PresetScriptModel>>('/presets/{id}/entries/{entryType}', {
                        code: data.get('code') as string,
                        name: data.get('name') as string,
                        content: "",
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
                    await put('/presets/{id}/entries/{entryType}/{entryId}/disabled', {
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
                    await post<EntryOperation<PresetScriptModel>>('/presets/{id}/entries/{entryType}', {
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
                    await put<EntryOperation<PresetScriptModel>>(
                        '/presets/{id}/entries/{entryType}/{entryId}',
                        {
                            content: data.get("content") as string,
                            priority: parseInt(data.get("priority") as string),
                            type: data.get("type") as string,
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
                    (<Editor entry={entry} formRef={formRef}/>)
            }}/>
    );
}

export const tabConfig: TabConfig = {
    id: engineName,
    hide: async () => presetTabIsHide(engineName),
    label: () => <EntryTabHeader space={moduleName} value={engineName} icon={Code2Icon}/>,
    component: Tab
}