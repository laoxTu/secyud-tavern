'use client'
import React, {useState} from "react";
import {
    NavigationMenu, NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList
} from "@/components/ui/navigation-menu";
import {Separator} from "@/components/ui/separator";
import {businessNavigationManager} from "@/business/client/navigation";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {Button} from "@/components/ui/button";
import {useTranslations} from 'next-intl';
import {locales} from "@/localization/config";
import Cookies from 'js-cookie';

export default function BusinessPage() {
    const tabs = businessNavigationManager.getSorted();
    const t = useTranslations();
    const firstTab = businessNavigationManager.getFirstTab();
    const [currentTab, setCurrentTab] = useState(firstTab?.id ?? "");
    const TabContent = businessNavigationManager.records[currentTab]?.component;
    const switchLanguage = (locale: string) => {
        Cookies.set('locale', locale, {expires: 30}); // 设置有效期为30天
        window.location.reload();
    };
    return (
        <div className="flex flex-col h-full">
            <div className="flex pt-1 px-2 justify-between">
                <NavigationMenu>
                    <NavigationMenuList className={"space-x-2"}>
                        {tabs.map((tab, index) => {
                            const Component = tab.label;
                            return (
                                <NavigationMenuItem key={index}>
                                    <NavigationMenuLink asChild>
                                        <a className={
                                            currentTab === tab.id
                                                ? 'pointer-events-none bg-gray-100'
                                                : 'cursor-pointer'
                                        } onClick={() => setCurrentTab(tab.id)}>
                                            <Component/>
                                        </a>
                                    </NavigationMenuLink>
                                </NavigationMenuItem>
                            );
                        })}
                    </NavigationMenuList>
                </NavigationMenu>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost">{t('default.language')}</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuGroup>
                            {locales.map((u, i) => (
                                <DropdownMenuItem key={i}
                                                  onClick={() => switchLanguage(u)}>
                                    {t(`default.${u}`)}
                                </DropdownMenuItem>))}
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>

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
