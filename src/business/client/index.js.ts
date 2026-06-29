'use client'

import {KeyboardEventHandler} from "react";

export function registerBusinessClient() {
}

export const submitTextareaOnKey: KeyboardEventHandler<HTMLTextAreaElement> =
    (e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            e.preventDefault();
            e.currentTarget?.form?.requestSubmit();
        }
    }