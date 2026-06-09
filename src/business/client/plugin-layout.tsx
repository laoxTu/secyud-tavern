'use client';
import React from "react";
import {useClientPlugins} from "@/client-registerer";

export function PluginLayout({
                                 children,
                             }: Readonly<{
    children: React.ReactNode;
}>) {

    const initialized = useClientPlugins();

    if (!initialized) return (
        <iframe className={"w-full h-full"} src="/loading.html"></iframe>
    );

    return (
        <>
            {children}
        </>
    );
}
