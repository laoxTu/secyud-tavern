'use client';

import React, {RefObject, useRef, useState} from "react";
import Editor, {OnMount} from "@monaco-editor/react";
import {useTheme} from "next-themes";
import {submitFormOnKey} from "@/business/client";
import {cn} from "@/lib/utils";
import {editor} from "monaco-editor";
import IStandaloneCodeEditor = editor.IStandaloneCodeEditor;

interface Props {
    name: string,
    defaultValue: string,
    language: string,
    className?: string,
    formRef: RefObject<HTMLFormElement | null>,
}

export function MonacoEditor({name, defaultValue, language, className, formRef}: Props) {
    const editorRef = useRef<IStandaloneCodeEditor>(null);
    const [content, setContent] = useState<string | undefined>(defaultValue);
    const {theme} = useTheme();
    const handleEditorDidMount: OnMount = (editor) => {
        // here is the editor instance
        // you can store it in `useRef` for further usage
        editorRef.current = editor;
        editor.onKeyDown((e) => submitFormOnKey(e, formRef));
    }
    return (<>
        <input type={'hidden'} name={name} value={content ?? ""}/>
        <Editor
            className={cn(
                "flex field-sizing-content min-h-16 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
                className
            )}
            height={'30rem'}
            theme={theme === 'dark' ? 'vs-dark' : 'light'}
            language={language}
            options={{
                wordWrap: 'on'
            }}
            value={content} onChange={setContent}
            onMount={handleEditorDidMount}
        />
    </>);
}