import React, {useMemo} from "react";
import {tabManager} from "..";
import {useTranslations} from "next-intl";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";

export default function HomeContent() {
    const tabs = useMemo(() => tabManager.getSorted(), [])

    return (
        <div className="st-app">
            <Tabs defaultValue={tabManager.getFirstTab()?.id} className={"st-app-tabs"}>
                <TabsList>
                    {tabs.map((tab, index) => {
                        const Component = tab.label;
                        return (
                            <TabsTrigger key={index} value={tab.id}>
                                <Component/>
                            </TabsTrigger>
                        );
                    })}
                </TabsList>
                {tabs.map((tab, index) => {
                    const Component = tab.component;
                    return (
                        <TabsContent key={index} value={tab.id}>
                            <Component/>
                        </TabsContent>
                    );
                })}
            </Tabs>
        </div>
    );
}
