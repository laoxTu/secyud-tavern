'use client';
import React, {RefObject, useRef, useState} from "react";
import {FileIcon} from "lucide-react";
import {useTranslations} from "next-intl";
import {Field, FieldLabel} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {TabManager} from "@/components/custom/tab";
import {put} from "@/client";
import {ModelUpdate} from "@/business/client/template/model-update";
import {ComfyUIWorkflowModel, moduleName} from "../models";
import {EntryTabHeader} from "@/business/client/template/tab-header";
import {modelState} from "@/modules/comfyui/client/models";
import MonacoEditor, {OnMount} from "@monaco-editor/react";
import {editorClassName} from "@/components/consts";
import {defaultEditorOptions} from "@/components";
import {useTheme} from "next-themes";
import {submitFormOnKey} from "@/business/client";
import {editor} from "monaco-editor";
import IStandaloneCodeEditor = editor.IStandaloneCodeEditor;

function UpdateContent({model, formRef}: { model: ComfyUIWorkflowModel, formRef: RefObject<HTMLFormElement | null> }) {
    const editorRef = useRef<IStandaloneCodeEditor>(null);
    const [content, setContent] = useState<string | undefined>(model.content?.workflow);
    const {theme} = useTheme();
    const t = useTranslations();
    const handleEditorDidMount: OnMount = (editor) => {
        // here is the editor instance
        // you can store it in `useRef` for further usage
        editorRef.current = editor;
        editor.onKeyDown((e) => submitFormOnKey(e, formRef));
    }

    return (<>
        <div className="grid md:grid-cols-2 gap-4">
            <Field>
                <Label htmlFor={`${moduleName}-code`}>{t("default.code") + "*"}</Label>
                <Input id={`${moduleName}-code`} name="code"
                       defaultValue={model.code} disabled/>
            </Field>
            <Field>
                <FieldLabel htmlFor={`${moduleName}-name`}>
                    {t("default.name")}
                </FieldLabel>
                <Input name="name" id={`${moduleName}-name`}
                       defaultValue={model.name}
                />
            </Field>
        </div>
        <Field>
            <FieldLabel htmlFor={`${moduleName}-workflow-content`}>
                {t("default.content")}
            </FieldLabel>
            <input type={'hidden'} name={'workflow-content'} value={content}/>
            <MonacoEditor className={editorClassName} height={'30rem'}
                          theme={theme === 'dark' ? 'vs-dark' : 'light'}
                          language={'json'}
                          options={defaultEditorOptions}
                          value={content} onChange={setContent}
                          onMount={handleEditorDidMount}
            />
        </Field>
    </>);
}

function DefaultTab() {
    return <ModelUpdate<ComfyUIWorkflowModel>
        modelState={modelState}
        props={{
            updateHandler: async (model, data) => {
                return await put("/llmapis/{id}",
                    {
                        content: {
                            workflow_content: data.get("workflow-content"),
                        },
                        name: data.get("name") as string,
                        code: model.code,
                    } as Partial<ComfyUIWorkflowModel>,
                    {
                        params: {"id": model.id,}
                    });
            },
            updateContent: (model, formRef) =>
                (<UpdateContent model={model} formRef={formRef}/>)
        }}/>
}

export const comfyuiWorkflowTabManager = new TabManager(moduleName, {
    id: 'default',
    label: () => <EntryTabHeader space="default" value="property" icon={FileIcon}/>,
    component: DefaultTab
});