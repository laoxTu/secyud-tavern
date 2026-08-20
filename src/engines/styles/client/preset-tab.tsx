import {PaletteIcon} from "lucide-react";
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
import {engineName, PresetStyleModel} from "../models";
import {MonacoEditor} from "@/components/custom/monaco-editor";
import {Selector} from "@/components/custom/selector";
import {spanHalf} from "@/components/custom/GridField";

const styleTypes = ["", "link", "text/css"];

function Editor({entry, formRef}: { entry: PresetStyleModel, formRef: RefObject<HTMLFormElement | null> }) {
    const t = useTranslations();
    const [type, setType] = useState(entry.type ?? null);

    const language = (() => {
        switch (type) {
            case "link":
                return "plaintext";
            default:
                return "css";
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
                {t("default.type")}
            </FieldLabel>
            <Selector name={'type'} id={`${engineName}-type-${entry.id}`}
                      value={type} onValueChange={setType}
                      items={styleTypes}/>
        </Field>
    </>);
}

function Tab() {
    const {model} = useItemState();
    return (
        <EntryList<PresetStyleModel>
            entryState={entryState}
            modelId={model!.id}
            createProps={{
                createHandler: async (data) => {
                    await post('/presets/{id}/entries/{entryType}', {
                        code: data.get('code'),
                        name: data.get('name'),
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
                    const result = {
                        ...entry,
                        content: data.get("content") as string,
                        priority: parseInt(data.get("priority") as string),
                        type: data.get("type") as string,
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
                    (<Editor entry={entry} formRef={formRef}/>)
            }}/>);
}

export const tabConfig: TabConfig = {
    id: engineName,
    label: () => <EntryTabHeader space={moduleName} value={engineName} icon={PaletteIcon}/>,
    component: Tab
}