'use client'
import React from "react";
import {useClientPlugins} from "@/client/initialize";
import {BusinessContent} from "@/client/business/page";


export default function BusinessPage() {
    const initialized = useClientPlugins();

    // TODO 加载动画
    if (!initialized) return null;

    return (
        <BusinessContent/>
    );
}
