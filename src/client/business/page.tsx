import React, {useMemo, useState} from "react";
import {
    NavigationMenuItem,
    NavigationMenuList,
    NavigationMenu,
    NavigationMenuIndicator, NavigationMenuLink
} from "@/components/ui/navigation-menu";
import {Separator} from "@/components/ui/separator";
import {businessNavigationManager} from "@/client/business";

export function BusinessContent() {
    const tabManager = useMemo(() => businessNavigationManager, []);
    const tabs = tabManager.getSorted();
    const firstTab = tabManager.getFirstTab();
    const [currentTab, setCurrentTab] = useState(firstTab?.id ?? "");
    const TabContent = tabManager.records[currentTab]?.component;

    return (
        <div className="flex flex-col h-full">
            <div className="flex p-1 justify-center">
                <NavigationMenu>
                    <NavigationMenuList className={"space-x-1"}>
                        {tabs.map((tab, index) => {
                            const Component = tab.label;
                            return (
                                <NavigationMenuItem key={index}>
                                    <NavigationMenuLink asChild>
                                        <a className={
                                            currentTab === tab.id
                                                ? 'pointer-events-none bg-gray-50'
                                                : 'cursor-pointer'
                                        } onClick={() => setCurrentTab(tab.id)}>
                                            <Component/>
                                        </a>
                                    </NavigationMenuLink>
                                </NavigationMenuItem>
                            );
                        })}
                    </NavigationMenuList>
                    <NavigationMenuIndicator/>
                </NavigationMenu>
            </div>
            <div className="flex-1 p-1 overflow-hidden">
                <Separator/>
                {TabContent && <TabContent/>}
                <Separator/>
            </div>
            <div className="text-right p-1">
                <p className="text-xs text-gray-500 m-auto mr-2">
                    Copyright (c) 2026 Secyud
                </p>
            </div>
        </div>
    );
}