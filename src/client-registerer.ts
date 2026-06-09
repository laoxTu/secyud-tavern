'use client';
import {useEffect, useRef, useState} from "react";
import {useErrorHandler} from "@/handler/client/error";
import {pluginManager} from "@/plugins/manager";
import {businessNavigationManager} from "@/business/client/navigation";
import {llmapiNavigationContent} from "@/llmapis/client/content";
import {presetNavigationContent} from "@/presets/client/content";
import {storyNavigationContent} from "@/stories/client/content";
import {registerDeepseekClient} from "@/engines/deepseek/client";
import {registerStylesClient} from "@/engines/styles/client";
import {registerScriptsClient} from "@/engines/scripts/client";
import {registerRegexesClient} from "@/engines/regexes/client";
import {registerLorebooksClient} from "@/engines/lorebooks/client";

async function loadClientPlugins() {
    businessNavigationManager.register(
        storyNavigationContent,
        presetNavigationContent,
        llmapiNavigationContent,
    )
    registerDeepseekClient();

    registerLorebooksClient();
    registerRegexesClient();
    registerStylesClient();
    registerScriptsClient();
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