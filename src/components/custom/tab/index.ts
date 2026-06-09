'use client';
import React from "react";
import {Registerable} from "@/utils/register";
import {ClientRegistry} from "@/plugins/client";

export interface TabConfig extends Registerable {
    label: React.ComponentType;
    component?: React.ComponentType;
}

// Tab 注册表
export class TabManager extends ClientRegistry<TabConfig> {
    constructor(name: string, config?: TabConfig) {
        super(name);
        if (config) {
            this.register(config);
        }
    }

    getFirstTab() {
        const tabs = this.getSorted();
        return tabs.length > 0 ? tabs[0] : undefined;
    }
}