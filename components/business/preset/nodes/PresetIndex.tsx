// pages/preset/nodes/PresetIndex.tsx
'use client';

import React, {useState, useCallback, useMemo} from "react";
import {usePager} from "@/components/pager";
import {get} from "@/src/api/client"
import {PagedResult} from "@/src/models/common";
import {PresetModel} from "@/src/business/preset/models";
import {PaginationWrapper} from "@/components/pager/nodes/PaginationWrapper";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {tabManager} from "@/components/business/preset";
import {useTranslations} from "next-intl";


export default function PresetIndex() {

    const tabs = useMemo(() => tabManager.getSorted(), [])
    const t = useTranslations();
    const [preset, setPreset] = useState<PresetModel | undefined>();

    const pager = usePager({
        fetcher: async params => await get("/presets", {
            params
        }) as PagedResult<PresetModel>
    });

    const handleSelect = useCallback(async (presetId: string) => {
        const res = await get('/presets/{id}', {
            method: 'GET',
            params: {
                id: presetId
            }
        }) as PresetModel;
        setPreset(res);
    }, []);

    return (
        <div className="preset-page">
            <div className="preset-sidebar">
                <div className="preset-list">
                    {pager.data.map(p => (
                        <div
                            key={p.id}
                            className="preset-item"
                            onClick={() => handleSelect(p.id)}
                        >
                            <span>{p.name}</span>
                        </div>
                    ))}
                </div>
                <div className="preset-pagination">
                    <PaginationWrapper defaultPageIndex={pager.pageIndex}
                                       onPageIndexChanged={pager.changePageIndex}
                                       pageCount={pager.pageCount}
                                       className="preset-pagination"/>
                </div>
            </div>
            <div className="preset-main">
                <Tabs defaultValue={tabManager.getFirstTab()?.id} className={"st-app-tabs"}>
                    <TabsList>
                        {tabs.map((tab, index) => {
                            return (
                                <TabsTrigger key={index} value={tab.id}> {tab.icon} {t(tab.label)}</TabsTrigger>
                            );
                        })}
                    </TabsList>
                    {preset && tabs.map((tab, index) => {
                        const Component = tab.component;
                        return (
                            <TabsContent key={index} value={tab.id}>
                                <Component preset={preset}/>
                            </TabsContent>
                        );
                    })}
                </Tabs>
            </div>
        </div>
    );
}