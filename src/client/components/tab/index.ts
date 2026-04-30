// src/client/components/tab/index.tsx
'use client';
import React from "react";
import {Registerable} from "@/shared/register";
import {ClientRegistry} from "@/client/plugins";

export interface TabConfig extends Registerable {
    label: React.ComponentType;
    component?: React.ComponentType;
}

// Tab 注册表
export class TabManager extends ClientRegistry<TabConfig> {
    getFirstTab() {
        const tabs = this.getSorted();
        return tabs.length > 0 ? tabs[0] : undefined;
    }
}