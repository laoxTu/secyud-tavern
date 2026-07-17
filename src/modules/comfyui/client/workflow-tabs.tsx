'use client';
import React, {RefObject, useRef, useState} from "react";
import {useTranslations} from "next-intl";
import {FileIcon} from "lucide-react";
import {put} from "@/client";
import {Field, FieldLabel} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {TabManager} from "@/components/custom/tab";
import {TemplateModelUpdate} from "@/business/client/template";
import {EntryTabHeader} from "@/business/client/template/tab-header";
import {moduleName, ComfyUIWorkflowModel} from "../models";
import {modelState} from "./models";
import {submitFormOnKey} from "@/business/client";
import MonacoEditor, {OnMount} from "@monaco-editor/react";
import {useTheme} from "next-themes";
import {editor} from "monaco-editor";
import IStandaloneCodeEditor = editor.IStandaloneCodeEditor;
import {editorClassName} from "@/components/consts";
import {defaultEditorOptions} from "@/components";

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
                <FieldLabel htmlFor={`${moduleName}-code`}>{t("default.code") + "*"}</FieldLabel>
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
            <input type={'hidden'} name={'workflow-content'} value={content ?? ""}/>
            <MonacoEditor className={editorClassName} height={'30rem'}
                          theme={theme === 'dark' ? 'vs-dark' : 'light'}
                          language={'json'}
                          options={defaultEditorOptions}
                          value={content} onChange={setContent}
                          onMount={handleEditorDidMount}
            />
        </Field>
        <Field>
            <FieldLabel htmlFor={`${moduleName}-description`}>
                {t("default.description")}
            </FieldLabel>
            <Textarea name={'description'}
                      id={`${moduleName}-description`}
                      defaultValue={model.content.description}/>
        </Field>
    </>);
}

export function DefaultTab() {
    return <TemplateModelUpdate<ComfyUIWorkflowModel>
        modelState={modelState}
        props={{
            updateHandler: async (model, data) => {

                return await put("/comfyuis/workflows/{id}",
                    {
                        content: {
                            workflow: data.get("workflow-content"),
                            description: data.get("description") as string,
                        },
                        name: data.get("name") as string,
                        code: model.code,
                    },
                    {
                        params: {"id": model.id,}
                    });
            },
            updateContent: (model, formRef) =>
                (<UpdateContent model={model} formRef={formRef}/>)
        }}

    />
}

export const comfyuiWorkflowTabManager = new TabManager(moduleName + "Workflow", {
    id: 'default',
    label: () => <EntryTabHeader space="default" value="property" icon={FileIcon}/>,
    component: DefaultTab
});