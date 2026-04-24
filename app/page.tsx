import React, { useMemo} from "react";
import {tabManager as layoutTabManager, tabManager} from "@/components/business/layout";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {useTranslations} from "next-intl";


export default function Home() {
    const tabs = useMemo(() => {


            console.log("=== 调试信息 ===");
            console.log("所有注册的 tabs:", layoutTabManager.getSorted());

        return tabManager.getSorted();
    }, [])
    const t = useTranslations();


    return (
        <div className="st-app">
            <Tabs defaultValue={tabManager.getFirstTab()?.id} className={"st-app-tabs"}>
                <TabsList>
                    {tabs.map((tab, index) => {
                        return (
                            <TabsTrigger key={index} value={tab.id}> {tab.icon} {t(tab.label)}</TabsTrigger>
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
