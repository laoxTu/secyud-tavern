import {PaletteIcon} from "lucide-react";
import React, {RefObject, useRef, useState} from "react";
import {useTranslations} from "next-intl";
import {del, post, put} from "@/client";
import {Field, FieldLabel} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {TabConfig} from "@/components/custom/tab";
import {editorClassName} from "@/components/consts";
import {TemplateEntryList} from "@/business/client/template";
import {EntryTabHeader} from "@/business/client/template/tab-header";
import {useItemState} from "@/modules/presets/client/models";
import {moduleName} from "@/modules/presets/models";
import MonacoEditor, {OnMount} from "@monaco-editor/react";
import {editor} from "monaco-editor";
import IStandaloneCodeEditor = editor.IStandaloneCodeEditor;
import {entryState} from "./models";
import {PresetScriptModel, engineName} from "../models";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {submitFormOnKey} from "@/business/client";
import {useTheme} from "next-themes";
import {defaultEditorOptions} from "@/components";

const scriptTypes = ["", "link", "application/javascript", "module", "importmap"];

function Editor({entry, formRef}: { entry: PresetScriptModel, formRef: RefObject<HTMLFormElement | null> }) {
    const t = useTranslations();
    const editorRef = useRef<IStandaloneCodeEditor>(null);
    const [type, setType] = useState(entry.type ?? "");
    const [content, setContent] = useState<string | undefined>(entry.content);
    const {theme} = useTheme();
    const handleEditorDidMount: OnMount = (editor) => {
        // here is the editor instance
        // you can store it in `useRef` for further usage
        editorRef.current = editor;
        editor.onKeyDown((e) => submitFormOnKey(e, formRef));
    }

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
        <div className="grid md:grid-cols-2 gap-4">
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
                <Select name={'type'}
                        value={type} onValueChange={setType}>
                    <SelectTrigger className="w-full"
                                   id={`${engineName}-type-${entry.id}`}>
                        <SelectValue/>
                    </SelectTrigger>
                    <SelectContent position="popper">
                        <SelectGroup>
                            {scriptTypes.map((e) =>
                                <SelectItem key={e} value={e}>
                                    {e}
                                </SelectItem>
                            )}
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </Field>
        </div>
        <Field>
            <FieldLabel onClick={() => editorRef.current?.focus()}>
                {t("default.content")}
            </FieldLabel>
            <input type={'hidden'} name={'content'} value={content}/>
            <MonacoEditor className={editorClassName} height={'30rem'}
                          theme={theme === 'dark' ? 'vs-dark' : 'light'}
                          options={defaultEditorOptions}
                          language={language}
                          value={content} onChange={setContent}
                          onMount={handleEditorDidMount}
            />
        </Field>
    </>);
}

function Tab() {
    const {model} = useItemState();
    return (
        <TemplateEntryList<PresetScriptModel>
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
            }}/>
    );
}

export const tabConfig: TabConfig = {
    id: engineName,
    label: () => <EntryTabHeader space={moduleName} value={engineName} icon={PaletteIcon}/>,
    component: Tab
}