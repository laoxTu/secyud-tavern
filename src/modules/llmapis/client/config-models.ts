'use client'
import {Registerable} from "@/utils/register";

export interface LlmapiConfig extends Registerable {
    component: React.ComponentType;
    getValue: (data: FormData) => any,
}