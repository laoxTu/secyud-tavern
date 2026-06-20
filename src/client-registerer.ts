'use client';
import {useEffect, useRef, useState} from "react";
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
import {registerOpenAIClient} from "@/engines/openai/client";

async function loadClientPlugins() {
    registerComponents();
    registerBusinessClient();
    registerStoryClient();
    registerPresetClient();
    registerLlmapiClient();
    registerSlotClient();

    registerDeepseekClient();
    registerOpenAIClient();

    registerLorebooksClient();
    registerRegexesClient();
    registerStylesClient();
    registerScriptsClient();
    registerMacrosClient();

    // 动态 import：plugin.ts 包含 monaco-editor 等浏览器专用库，
    // 必须在客户端加载，SSR 会因 window 不存在而崩溃
    const {buildPluginApi} = await import('./plugin');
    buildPluginApi();

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