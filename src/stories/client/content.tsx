'use client';
import React from "react";
import {useTranslations} from "next-intl";
import {Field} from "@/components/ui/field";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {ItemContent, ItemDescription, ItemTitle} from "@/components/ui/item";
import {ModelListContentTemplate} from "@/components/template/content-template";
import {ModelNavigationTemplate} from "@/components/template/navigation-template";
import {TabConfig} from "@/components/custom/tab";
import {post} from "@/client";
import {Button} from "@/components/ui/button";
import {useRouter} from "next/navigation";
import {moduleArrayName, moduleName, StoryModel} from "@/stories/models";
import {StoryContext} from "@/stories/client/models";
import {storyTabManager} from "@/stories/client/tabs";


function Content() {
    const t = useTranslations();
    const router = useRouter();

    return <ModelListContentTemplate<StoryModel>
        modelType={moduleName} modelApi={moduleArrayName} contextType={StoryContext}
        modelContent={(model) =>
            <>
                <ItemContent>
                    <ItemTitle className="line-clamp-1">
                        {model.name} - <span className={"text-muted-foreground"}> {model.id} </span>
                    </ItemTitle>
                    <ItemDescription>
                        <Button onClick={() => router.replace(`/business/stories/${model.id}`)}>
                            {t("story.enter")}
                        </Button>
                    </ItemDescription>
                </ItemContent>
            </>
        }
        cloneHandler={async (model, data) =>
            await post(`/${moduleArrayName}`, {
                ...model, name: data.get("name") as string,
            })}
        cloneContent={() =>
            <>
                <Field>
                    <Label htmlFor={`${moduleName}-clone-name`}>{t("default.name") + "*"}</Label>
                    <Input id={`${moduleName}-clone-name`} name="name" required/>
                </Field>
            </>}
        createHandler={async (data) =>
            await post(`/${moduleArrayName}`, {
                id: "",
                name: data.get("name") as string,
                requires: [],
                llmapi: null,
                content: {},
            })}
        createContent={() =>
            <>
                <Field>
                    <Label htmlFor={`${moduleName}-name`}>{t("default.name") + "*"}</Label>
                    <Input id={`${moduleName}-name`} name="name"
                           required/>
                </Field>
            </>}
        tabManagerAccessor={() => storyTabManager}>
    </ModelListContentTemplate>;
}


export const storyNavigationContent: TabConfig = {
    id: moduleName,
    label: () => <ModelNavigationTemplate modelType={moduleName}/>,
    component: Content
} as const;
