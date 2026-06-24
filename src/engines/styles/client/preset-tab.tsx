import {PaletteIcon} from "lucide-react";
import React, {useRef} from "react";
import {useTranslations} from "next-intl";
import {del, post, put} from "@/client";
import {Field, FieldLabel} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {TabConfig} from "@/components/custom/tab";
import {editorClassName} from "@/components/consts";
import {TemplateEntryList} from "@/business/client/template";
import {EntryTabHeader} from "@/business/client/template/tab-header";
import {useItemState} from "@/presets/client/models";
import {moduleName} from "@/presets/models";
import Editor, {OnMount} from "@monaco-editor/react";
import {editor} from "monaco-editor";
import IStandaloneCodeEditor = editor.IStandaloneCodeEditor;
import {entryState} from "./models";
import {PresetStyleModel, engineName} from "../models";

function Tab() {
    const t = useTranslations();
    const {model} = useItemState();
    const editorRef = useRef<IStandaloneCodeEditor>(null);
    const handleEditorDidMount: OnMount = (editor) => {
        // here is the editor instance
        // you can store it in `useRef` for further usage
        editorRef.current = editor;
    }
    return (
        <TemplateEntryList<PresetStyleModel>
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
                        content: editorRef.current?.getValue() ?? "",
                        priority: parseInt(data.get("priority") as string),
                    }
                    await put('/stories/{id}/entries/{entryType}/{entryId}', result, {
                        params: {
                            id: model?.id,
                            entryType: engineName,
                            entryId: entry.id
                        }
                    });
                    return result;
                },
                updateContent: (entry) => (<>
                    <div className="grid grid-cols-2 gap-4">
                        <Field>
                            <FieldLabel htmlFor={`${engineName}-priority-${entry.id}`}>
                                {t("default.priority")}
                            </FieldLabel>
                            <Input name="priority" type={"number"}
                                   id={`${engineName}-priority-${entry.id}`}
                                   defaultValue={entry.priority}/>
                        </Field>
                    </div>
                    <Field>
                        <FieldLabel onClick={() => editorRef.current?.focus()}>
                            {t("default.content")}
                        </FieldLabel>
                        <Editor className={editorClassName}
                                defaultLanguage={'css'} height={'20rem'}
                                defaultValue={entry.content}
                                onMount={handleEditorDidMount}/>
                    </Field>
                </>)
            }}/>
    );
}

export const tabConfig: TabConfig = {
    id: engineName,
    label: () => <EntryTabHeader space={moduleName} value={engineName} icon={PaletteIcon}/>,
    component: Tab
}