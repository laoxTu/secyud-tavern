import {registerBusiness} from "@/client/business";
import {pluginManager} from "@/shared/plugins";
import {useEffect, useRef, useState} from "react";
import {useErrorHandler} from "@/client/errors";

async function loadClientPlugins() {
    registerBusiness();
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