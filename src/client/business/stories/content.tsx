'use client';
import React from "react";
import {useTranslations} from "next-intl";
import {Field} from "@/components/ui/field";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {ItemContent, ItemTitle} from "@/components/ui/item";
import {ModelListContentTemplate} from "@/client/business/template/content-template";
import {ModelNavigationTemplate} from "@/client/business/template/navigation-template";
import {TabConfig} from "@/client/components/tab";
import {post} from "@/client";
import {StoryModel, name as modelType} from "@/shared/business/stories";
import {modelApi, StoryContext} from "./context";
import {storyTabManager} from ".";


function Content() {
    const t = useTranslations();

    return <ModelListContentTemplate<StoryModel>
        modelType={modelType} modelApi={modelApi} contextType={StoryContext}
        modelContent={(model) =>
            <>
                <ItemContent>
                    <ItemTitle className="line-clamp-1">
                        {model.name} - <span className={"text-muted-foreground"}> {model.id} </span>
                    </ItemTitle>
                </ItemContent>
            </>
        }
        cloneHandler={async (model, data) =>
            await post(`/${modelApi}`, {
                ...model, name: data.get("name") as string,
            })}
        cloneContent={() =>
            <>
                <Field>
                    <Label htmlFor={`${modelType}-clone-name`}>{t("default.name") + "*"}</Label>
                    <Input id={`${modelType}-clone-name`} name="name" required/>
                </Field>
            </>}
        createHandler={async (data) =>
            await post(`/${modelApi}`, {
                id: "",
                name: data.get("name") as string,
                requires: [],
                llmapi: null,
                content: {},
            })}
        createContent={() =>
            <>
                <Field>
                    <Label htmlFor={`${modelType}-name`}>{t("default.name") + "*"}</Label>
                    <Input id={`${modelType}-name`} name="name"
                           required/>
                </Field>
            </>}
        tabManagerAccessor={() => storyTabManager}>
    </ModelListContentTemplate>;
}


export const tabConfig: TabConfig = {
    id: modelType,
    label: () => <ModelNavigationTemplate modelType={modelType}/>,
    component: Content
} as const;
