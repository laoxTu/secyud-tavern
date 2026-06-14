'use client';
import {useEffect, useRef, useState} from "react";
import {useErrorHandler} from "@/handler/client/error";
import {pluginManager} from "@/plugins/manager";
import {registerDeepseekClient} from "@/engines/deepseek/client";
import {registerStylesClient} from "@/engines/styles/client";
import {registerScriptsClient} from "@/engines/scripts/client";
import {registerRegexesClient} from "@/engines/regexes/client";
import {registerLorebooksClient} from "@/engines/lorebooks/client";
import {registerLlmapiClient} from "@/llmapis/client";
import {registerStoryClient} from "@/stories/client";
import {registerPresetClient} from "@/presets/client";
import {registerMacrosClient} from "@/engines/macros/client";

async function loadClientPlugins() {
    registerStoryClient();
    registerPresetClient();
    registerLlmapiClient();

    registerDeepseekClient();

    registerLorebooksClient();
    registerRegexesClient();
    registerStylesClient();
    registerScriptsClient();
    registerMacrosClient();
    await pluginManager.loadClientPlugins();
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