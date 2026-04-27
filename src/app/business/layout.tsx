import React, {useMemo} from "react";
import {
    NavigationMenuItem,
    NavigationMenuList,
    NavigationMenu,
    NavigationMenuIndicator
} from "@/components/ui/navigation-menu";
import {businessNavigationManager} from "@/app/business/index";


export default function BusinessLayout({
                                           children,
                                       }: Readonly<{
    children: React.ReactNode;
}>) {
    const tabs = useMemo(() => businessNavigationManager.getSorted(), [])

    return (
        <div className="flex flex-col w-full">
            <div className="flex justify-center text-center p-1">
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
            <div className="w-full h-full px-2">
                {children}
            </div>
            <div className="flex p-2">
                <p className="text-xs text-gray-500 m-auto mr-2">
                    Copyright (c) 2026 Secyud
                </p>
            </div>
        </div>
    );
}
