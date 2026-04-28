
"use client"

import { useEffect, useRef } from "react"
import { initializeBusiness } from "@/app/business"
import { pluginManager } from "@/plugins"

const useClientPlugins = () => {
    const initialized = useRef(false)

    useEffect(() => {
        if (!initialized.current) {
            initialized.current = true
            initializeBusiness()
            pluginManager.loadClientPlugins().then(() => {
                console.log("[plugin] client plugins loaded")
            })
        }
    }, [])
}

export default useClientPlugins