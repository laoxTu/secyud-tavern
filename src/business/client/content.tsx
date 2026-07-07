'use client'
import React from "react";
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList
} from "@/components/ui/navigation-menu";
import {businessNavigationManager} from "@/business/client/navigation";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {Separator} from "@/components/ui/separator";
import {Button} from "@/components/ui/button";
import {useTranslations} from 'next-intl';
import {locales} from "@/localization/config";
import Cookies from 'js-cookie';
import {create} from "zustand";
import {persist, createJSONStorage} from 'zustand/middleware'

export interface BusinessTabState {
    businessTabId: string;
    setBusinessTabId: (tabId: string) => void;
}

export const useBusinessTabState =
    create<BusinessTabState>()(persist(
        (set) => ({
            businessTabId: businessNavigationManager.getFirstTab()?.id ?? "",
            setBusinessTabId: (tab) => set({businessTabId: tab}),
        }),
        {
            name: 'business-tab-id',
            storage: createJSONStorage(() => localStorage),
            partialize: state => ({
                businessTabId: state.businessTabId,
            })
        }
    ));

export function BusinessPageContent() {
    const tabs = businessNavigationManager.getSorted();
    const t = useTranslations();
    const {businessTabId, setBusinessTabId} = useBusinessTabState();
    const TabContent = businessNavigationManager.records[businessTabId]?.component;
    const switchLanguage = (locale: string) => {
        Cookies.set('locale', locale, {expires: 30}); // 设置有效期为30天
        window.location.reload();
    };
    return (
        <div className="flex flex-col h-full">
            <div className="flex pt-1 px-2">
                <NavigationMenu className={'flex-1 overflow-auto scrollbar-none max-w-full justify-normal'}>
                    <NavigationMenuList className={"gap-2 text-nowrap"}>
                        {tabs.map((tab, index) => {
                            const Component = tab.label;
                            return (
                                <NavigationMenuItem key={index}>
                                    <NavigationMenuLink asChild>
                                        <a className={
                                            businessTabId === tab.id
                                                ? 'pointer-events-none bg-secondary text-secondary-foreground'
                                                : 'cursor-pointer'
                                        } onClick={() => setBusinessTabId(tab.id)}>
                                            <Component/>
                                        </a>
                                    </NavigationMenuLink>
                                </NavigationMenuItem>
                            );
                        })}
                    </NavigationMenuList>
                </NavigationMenu>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild className={'my-auto'}>
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
