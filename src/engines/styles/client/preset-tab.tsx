import {PaletteIcon} from "lucide-react";
import React, {useRef} from "react";
import {useTranslations} from "next-intl";
import {Field, FieldLabel} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {EntryNavigationTemplate} from "@/components/template/navigation-template";
import {EntryListTemplate} from "@/components/template/entry-list-template";
import {TabConfig} from "@/components/custom/tab";
import {PresetModel, moduleName, moduleArrayName} from "@/presets/models";
import {PresetContext} from "@/presets/client/models";
import {PresetStyleModel, engineName} from "../models";
import {EntryModel} from "@/business/models";
import Editor, {OnMount} from "@monaco-editor/react";
import {editorClassName} from "@/components/consts";
import {editor} from "monaco-editor";
import IStandaloneCodeEditor = editor.IStandaloneCodeEditor;

function Tab() {
    const t = useTranslations();
    const editorRef = useRef<IStandaloneCodeEditor>(null);
    const handleEditorDidMount: OnMount = (editor) => {
        // here is the editor instance
        // you can store it in `useRef` for further usage
        editorRef.current = editor;
    }
    return (
        <EntryListTemplate<PresetModel>
            modelType={moduleName} modelApi={moduleArrayName} entryType={engineName} contextType={PresetContext}
            createAccessor={(): Omit<PresetStyleModel, keyof EntryModel> => ({
                content: "",
                priority: 100,
            })}
            updateAccessor={(data): Omit<PresetStyleModel, keyof EntryModel> => ({
                content: editorRef.current?.getValue() ?? "",
                priority: parseInt(data.get("priority") as string),
            })}
            updateContent={(entry: PresetStyleModel) => (
                <>
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
                </>
            )}></EntryListTemplate>
    );
}

export const tabConfig: TabConfig = {
    id: engineName,
    label: () => <EntryNavigationTemplate space={moduleName} value={engineName} icon={PaletteIcon}/>,
    component: Tab
}