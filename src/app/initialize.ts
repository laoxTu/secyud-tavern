"use client"

import {useEffect, useState} from "react"
import {initializeBusiness} from "@/app/business"
import {pluginManager} from "@/plugins"

const useClientPlugins = () => {
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        if (initialized) return;
        initializeBusiness()
        pluginManager.loadClientPlugins().then(() => {
            console.log("[plugin] client plugins loaded");
            setInitialized(true);
        })
    }, [initialized]);
    return initialized;
}

export default useClientPlugins