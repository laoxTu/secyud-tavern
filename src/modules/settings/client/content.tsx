'use client';
import React from "react";
import {TabConfig} from "@/components/custom/tab";
import {moduleName} from "../models";
import {settingTabManager} from "./tabs";
import {ModelTabHeader} from "@/business/client/template/tab-header";
import {createUseTabState} from "@/business/client/models";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Separator} from "@/components/ui/separator";

export const useSettingTabState = createUseTabState(settingTabManager);

function Content() {
    const {tabId, setTabId} = useSettingTabState();
    const tabs = settingTabManager.getSorted();

    return (
        <Tabs value={tabId} onValueChange={setTabId} className={"flex flex-col h-full p-4"}>
            <TabsList className="overflow-x-auto scrollbar-none gap-1 justify-normal">
                {tabs.map((tab, index) => {
                    const Component = tab.label;
                    return (
                        <TabsTrigger key={index} value={tab.id}>
                            <Component/>
                        </TabsTrigger>
                    );
                })}
            </TabsList>
            <Separator orientation={'horizontal'}/>
            {tabs.map((tab) => {
                const Component = tab.component;
                if (!Component) return null;
                return (
                    <TabsContent key={tab.id} value={tab.id}
                                 className="flex-1">
                        <Component/>
                    </TabsContent>
                );
            })}
        </Tabs>);
}

export const settingNavigationContent: TabConfig = {
    id: moduleName,
    sequence: 1000,
    label: () => <ModelTabHeader modelType={moduleName}/>,
    component: Content
} as const;
