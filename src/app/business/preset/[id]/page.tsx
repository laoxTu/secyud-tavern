'use client';
import {useParams, useRouter} from "next/navigation";
import React, {useEffect, useMemo, useState} from "react";
import {get} from "@/api/client";
import {PresetModel} from "@/business/preset/models";
import {useErrorHandler} from "@/components/message";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {presetTabManager} from "@/app/business/preset";
import {LoadingTemplateCard} from "@/components/loading";

export default function PresetContent() {
    const params = useParams();
    const [preset, setPreset] = useState<PresetModel | undefined>();
    const router = useRouter();
    const {handleError} = useErrorHandler();

    const id = params.id;
    const tabs = useMemo(() => presetTabManager.getSorted(), [])
    const firstTab = presetTabManager.getFirstTab();


    useEffect(() => {
        if (preset) {
            return;
        }
        const navigateToIndex = () => {
            router.replace("/business/presets");
        }

        if (!id) {
            navigateToIndex();
            return;
        }

        (async () => {
            try {
                const res = await get('/presets/{id}', {
                    method: 'GET',
                    params: {id}
                }) as PresetModel;
                setPreset(res);
            } catch (err) {
                handleError(err as Error);
                navigateToIndex();
            }
        })();
    }, [handleError, id, preset, router]);

    if (!preset) {
        return (
            <LoadingTemplateCard/>
        );
    }

    return (
        <div className="w-full h-full">
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
                    if (!Component) return null;
                    return (
                        <TabsContent key={index} value={tab.id}>
                            <Component preset={preset}/>
                        </TabsContent>
                    );
                })}
            </Tabs>
        </div>
    )
}