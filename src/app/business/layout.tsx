// src/app/business/layout.tsx
'use client';
import React from "react";
import {PluginLayout} from "@/business/client/plugin-layout";


export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <PluginLayout>
            {children}
        </PluginLayout>
    );
}
