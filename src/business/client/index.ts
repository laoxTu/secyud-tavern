'use client'

import {RefObject} from "react";
import {businessNavigationManager} from "@/business/client/navigation";
import {tabConfig} from "@/business/client/image-tab";

export function registerBusinessClient() {
    businessNavigationManager.register(tabConfig);
}


interface IKeyboardEvent {
    ctrlKey: boolean;
    metaKey: boolean;
    code: string;
    preventDefault: () => void;
    stopPropagation: () => void;
    currentTarget?: {
        form: HTMLFormElement | null;
    }
}

/**
 * 方便复用 ctrl + enter 作为text area的提交
 * @param e
 */
export const submitTargetFormOnKey =
    (e: IKeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && (e.code === 'Enter' || e.code === 'KeyS')) {
            e.preventDefault();
            e.stopPropagation();
            e.currentTarget?.form?.requestSubmit();
        }
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