'use client'
import {EditorRegisterable} from "@/business/client/models";


export interface LlmapiConfig extends EditorRegisterable {
    getValue: (data: FormData) => any,
}