'use client'
import React, {useMemo} from "react";
import {
    NavigationMenuItem,
    NavigationMenuList,
    NavigationMenu,
    NavigationMenuIndicator
} from "@/components/ui/navigation-menu";
import {businessNavigationManager} from "@/app/business/index";
import useClientPlugins from "@/app/initialize";
import {Separator} from "@/components/ui/separator";


function InnerLayout({
                         children,
                     }: Readonly<{
    children: React.ReactNode;
}>) {
    const tabs = useMemo(() => businessNavigationManager.getSorted(), []);

    return (
        <div className="flex flex-col h-full">
            <div className="flex p-1 justify-center">
                <NavigationMenu>
                    <NavigationMenuList>
                        {tabs.map((tab, index) => {
                            const Component = tab.label;
                            return (
                                <NavigationMenuItem key={index}>
                                    <Component/>
                                </NavigationMenuItem>
                            );
                        })}
                    </NavigationMenuList>
                    <NavigationMenuIndicator/>
                </NavigationMenu>
            </div>
            <div className="flex-1 p-1 overflow-hidden">
                <Separator/>
                {children}
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

export default function BusinessLayout({
                                           children,
                                       }: Readonly<{
    children: React.ReactNode;
}>) {
    const initialized = useClientPlugins();
    if (!initialized) return null;

    return (
        <InnerLayout>{children}</InnerLayout>
    );
}
