'use client';
import {useEffect, useRef, useState} from "react";
import {useErrorHandler} from "@/handler/client/error";
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
import {registerBusinessClient} from "@/business/client";
import {registerComponents} from "@/components";
import {registerOpenAIClient} from "@/engines/openai/client";
import {registerClientPlugin} from "@/plugins/client/registerer";
import {registerSettingClient} from "@/settings/client";

async function loadClientPlugins() {
    registerComponents();
    registerBusinessClient();
    registerStoryClient();
    registerPresetClient();
    registerLlmapiClient();
    registerSlotClient();

    registerSettingClient();

    registerDeepseekClient();
    registerOpenAIClient();

    registerLorebooksClient();
    registerRegexesClient();
    registerStylesClient();
    registerScriptsClient();
    registerMacrosClient();

    await registerClientPlugin();
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