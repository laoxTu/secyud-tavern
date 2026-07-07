'use client';
import React from "react";
import {TabConfig} from "@/components/custom/tab";
import {moduleName} from "../models";
import {settingTabManager} from "./tabs";
import {ModelTabHeader} from "@/business/client/template/tab-header";
import {createUseTabState} from "@/business/client/models";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Separator} from "@/components/ui/separator";

export const useStoryTabState = createUseTabState(settingTabManager);

function Content() {
    const {tabId, setTabId} = useStoryTabState();
    const tabs = settingTabManager.getSorted();

    return (
        <Tabs value={tabId} onValueChange={setTabId} orientation="vertical" className={"flex h-full p-4"}>
            <TabsList className="overflow-y-auto scrollbar-none gap-1 justify-normal">
                {tabs.map((tab, index) => {
                    const Component = tab.label;
                    return (
                        <TabsTrigger key={index} value={tab.id}>
                            <Component/>
                        </TabsTrigger>
                    );
                })}
            </TabsList>
            <Separator orientation={'vertical'}/>
            {tabs.map((tab) => {
                const Component = tab.component;
                if (!Component) return null;
                return (
                    <TabsContent key={tab.id} value={tab.id}
                                 className="w-full h-full">
                        <Component/>
                    </TabsContent>
                );
            })}
        </Tabs>);
}

export const settingNavigationContent: TabConfig = {
    id: moduleName,
    label: () => <ModelTabHeader modelType={moduleName}/>,
    component: Content
} as const;
