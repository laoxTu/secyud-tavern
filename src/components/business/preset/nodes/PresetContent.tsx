// pages/preset/nodes/PresetContent.tsx
'use client';

import React, {useState, useCallback, useMemo} from "react";
import {usePager} from "@/components/pager";
import {get} from "@/api/client"
import {PagedResult} from "@/models/common";
import {PresetModel} from "@/business/preset/models";
import {PaginationWrapper} from "@/components/pager/nodes/PaginationWrapper";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {tabManager} from "@/components/business/preset";
import {Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle} from "@/components/ui/empty";
import {Button} from "@/components/ui/button";
import {useTranslations} from "next-intl";
import {Skeleton} from "@/components/ui/skeleton";
import {Card, CardContent, CardHeader} from "@/components/ui/card";
import {FolderOpenIcon,ArrowUpRightIcon} from "lucide-react";
// import {ArrowUpRightIcon} from "lucide-react";

function PresetTabs({preset}: { preset: PresetModel | undefined }) {
    const tabs = useMemo(() => tabManager.getSorted(), [])
    const firstTab = tabManager.getFirstTab();

    if (!preset) {
        return null;
    }

    return (
        <Tabs defaultValue={firstTab?.id}>
            <TabsList>
                {tabs.map((tab, index) => {
                    const Component = tab.label;
                    return (
                        <TabsTrigger key={index} value={tab.id}>
                            <Component preset={preset}/>
                        </TabsTrigger>
                    );
                })}
            </TabsList>
            {tabs.map((tab, index) => {
                const Component = tab.component;
                return (
                    <TabsContent key={index} value={tab.id}>
                        <Component preset={preset}/>
                    </TabsContent>
                );
            })}
        </Tabs>
    );
}

export default function PresetContent() {

    const [preset, setPreset] = useState<PresetModel | undefined>();
    const t = useTranslations();

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

    if (pager.loading) {
        return (
            <Card className="w-full max-w-xs">
                <CardHeader>
                    <Skeleton className="h-4 w-2/3"/>
                    <Skeleton className="h-4 w-1/2"/>
                </CardHeader>
                <CardContent>
                    <Skeleton className="aspect-video w-full"/>
                </CardContent>
            </Card>
        )
    }

    if (pager.pageCount === 0) {
        return (
            <Empty>
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <FolderOpenIcon/>
                    </EmptyMedia>
                    <EmptyTitle>{t("preset.empty_title")}</EmptyTitle>
                    <EmptyDescription>
                        {t("preset.empty_description")}
                    </EmptyDescription>
                </EmptyHeader>
                <EmptyContent className="flex-row justify-center gap-2">
                    <Button> {t("default.create")}</Button>
                    <Button variant="outline">{t("default.import")}</Button>
                </EmptyContent>
                {/* 官方示例 有个帮助按钮，可以留着，以后跳到帮助文档 */}
                <Button
                    variant="link"
                    asChild
                    className="text-muted-foreground"
                    size="sm">
                    <a href="#">
                        Learn More <ArrowUpRightIcon/>
                    </a>
                </Button>
            </Empty>
        );
    }


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
                <PresetTabs preset={preset}/>
            </div>
        </div>
    );
}