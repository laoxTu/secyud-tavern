'use client';
import React from "react";
import {useTranslations} from "next-intl";
import {del, get, open, post} from "@/client";
import {Field} from "@/components/ui/field";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {ItemContent, ItemDescription, ItemTitle} from "@/components/ui/item";
import {Button} from "@/components/ui/button";
import {TabConfig} from "@/components/custom/tab";
import {useRouter} from "next/navigation";
import {CornerDownLeftIcon} from "lucide-react";
import {ModelList} from "@/business/client/template/model-list";
import {moduleName, StoryModel} from "../models";
import {storyTabManager} from "./tabs";
import {modelState} from "./models";
import {ModelTabHeader} from "@/business/client/template/tab-header";
import {createUseTabState} from "@/business/client/models";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";
import {useRemoteSettingState} from "@/modules/settings/client/models";
import {ModelOperation} from "@/business/models";

export const useStoryTabState = createUseTabState(storyTabManager);

function Content() {
    const t = useTranslations();
    const router = useRouter();

    return <ModelList<StoryModel>
        modelState={modelState}
        itemContent={(model) => (<>
            <ItemContent className={'flex-1 truncate'}>
                <ItemTitle className="truncate">
                    {model.name} - <span className="text-muted-foreground">
                    {model.id}
                </span>
                </ItemTitle>
                <ItemDescription>{model.llmapi?.code}</ItemDescription>
            </ItemContent>
            <ItemContent className="flex-none text-center">
                <Tooltip>
                    <TooltipTrigger onClick={() => router.push(`/business/stories/${model.id}`)}
                                    render={<Button variant={'outline'}/>}>
                        <CornerDownLeftIcon/>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{t('story.enter')}</p>
                    </TooltipContent>
                </Tooltip>
            </ItemContent>
        </>)}
        createProps={{
            importAccept: ".json",
            importHandler: async (file) => {
                return await post("/stories/import", file, {
                    headers: {
                        'Content-Type': "application/octet-stream"
                    }
                })
            },
            createContent: () => (<>
                <Field>
                    <Label htmlFor={`${moduleName}-name`}>{t("default.name") + "*"}</Label>
                    <Input id={`${moduleName}-name`} name="name"
                           required/>
                </Field>
            </>),
            createHandler: async (data) => {
                return await post<ModelOperation<StoryModel>>("/stories", {
                    name: data.get("name") as string,
                    requires: [],
                    llmapi: useRemoteSettingState
                        .getState().llmapi,
                    content: {},
                });
            },
        }}
        contentProps={{
            cloneHandler: async (model, data) => {
                const entity = await get("/stories/{id}", {
                    params: {
                        id: model.id,
                        withDetails: true
                    }
                });
                return await post<ModelOperation<StoryModel>>("/stories", {
                    ...entity, id: undefined,
                    name: data.get("name") as string,
                })
            },
            cloneContent: (model) => (<>
                <Field>
                    <Label htmlFor={`${moduleName}-clone-name`}>{t("default.name") + "*"}</Label>
                    <Input id={`${moduleName}-clone-name`}
                           defaultValue={model.name}
                           name="name" required/>
                </Field>
            </>),
            exportHandler: async (model) => {
                await open('/stories/{id}/export', {
                    params: {
                        id: model.id,
                    }
                });
            },
            deleteHandler: async (model) => {
                await del('/stories/{id}', {
                    params: {
                        id: model.id,
                    }
                });
            },
            useTabState: useStoryTabState,
            tabManager: storyTabManager
        }}>
    </ModelList>;
}

export const storyNavigationContent: TabConfig = {
    id: moduleName,
    label: () => <ModelTabHeader modelType={moduleName}/>,
    component: Content
} as const;
