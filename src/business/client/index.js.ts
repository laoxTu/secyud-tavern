'use client'

import {KeyboardEventHandler, RefObject} from "react";

export function registerBusinessClient() {
}

/**
 * 方便复用 ctrl + enter 作为text area的提交
 * @param e
 */
export const submitTextareaOnKey: KeyboardEventHandler<HTMLTextAreaElement> =
    (e) => {
        if ((e.ctrlKey || e.metaKey) && (e.code === 'Enter' || e.code === 'KeyS')) {
            e.preventDefault();
            e.stopPropagation();
            e.currentTarget?.form?.requestSubmit();
        }
    }

interface IKeyboardEvent {
    ctrlKey: boolean;
    metaKey: boolean;
    code: string;
    preventDefault: () => void;
    stopPropagation: () => void;
}

/**
 * 方便复用 ctrl + enter 作为各种editor的提交
 * @param e
 * @param formRef
 */
export const submitFormOnKey =
    (e: IKeyboardEvent, formRef: RefObject<HTMLFormElement | null>) => {
        if ((e.ctrlKey || e.metaKey) && (e.code === 'Enter' || e.code === 'KeyS')) {
            e.preventDefault();
            e.stopPropagation();
            // 提交表单
            formRef.current?.requestSubmit();
        }
    }