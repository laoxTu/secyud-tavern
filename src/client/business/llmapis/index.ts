'use client';
import {TabManager} from "@/client/components/tab";
import {tabConfig as normalTab} from "./normal/content";
import {registerLlmapiConfig} from "@/client/business/llmapis/normal";

export const llmapiTabManager = new TabManager("llmapi tabs");

export function registerLlmapi() {
    llmapiTabManager
        .register(
            normalTab,
        );

    registerLlmapiConfig();
}

