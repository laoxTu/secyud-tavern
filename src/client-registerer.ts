'use client';
import React, {useEffect, useRef, useState} from "react";
import {useErrorHandler} from "@/handler/client/error";
import {pluginManager} from "@/plugins/manager";
import {pluginApi} from "@/plugins/client/api";
import {registerDeepseekClient} from "@/engines/deepseek/client";
import {registerStylesClient} from "@/engines/styles/client";
import {registerScriptsClient} from "@/engines/scripts/client";
import {registerRegexesClient} from "@/engines/regexes/client";
import {registerLorebooksClient} from "@/engines/lorebooks/client";
import {registerLlmapiClient} from "@/llmapis/client";
import {registerStoryClient} from "@/stories/client";
import {registerPresetClient} from "@/presets/client";
import {registerMacrosClient} from "@/engines/macros/client";
import {registerSlotClient} from "@/slots/client";
import {registerBusinessClient} from "@/business/client/index.js";
import {registerComponents} from "@/components";

if (typeof window !== 'undefined') {
    (window as any).__PLUGIN_REACT__ = React;
    (window as any).__PLUGIN_API__ = pluginApi;
}

async function loadClientPlugins() {
    registerComponents();
    registerBusinessClient();
    registerStoryClient();
    registerPresetClient();
    registerLlmapiClient();
    registerSlotClient();

    registerDeepseekClient();

    registerLorebooksClient();
    registerRegexesClient();
    registerStylesClient();
    registerScriptsClient();
    registerMacrosClient();

    await pluginManager.loadClientPlugins(pluginApi);
}

export const useClientPlugins = () => {
    const [initialized, setInitialized] = useState(false);
    const hasLoadedRef = useRef(false);
    const {handleError} = useErrorHandler();
    useEffect(() => {
        if (hasLoadedRef.current) return;
        hasLoadedRef.current = true;
        loadClientPlugins()
            .then(() => {
                setInitialized(true);
            })
            .catch(error => {
                handleError(error);
            });
    }, [handleError]);  // 空依赖
    return initialized;
}