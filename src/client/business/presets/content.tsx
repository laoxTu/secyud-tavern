'use client';
import React from "react";
import {useTranslations} from "next-intl";
import {Field} from "@/components/ui/field";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {ItemContent, ItemDescription, ItemTitle} from "@/components/ui/item";
import {PresetModel} from "@/shared/business/presets";
import {TabConfig} from "@/client/components/tab";
import {ModelListContentTemplate} from "@/client/business/template/content-template";
import {ModelNavigationTemplate} from "@/client/business/template/navigation-template";
import {post} from "@/client";
import {PresetContext, modelApi} from "./context";
import {modelType} from "./context";
import {presetTabManager} from ".";


function Content() {
    const t = useTranslations();

    return <ModelListContentTemplate<PresetModel>
        modelType={modelType} modelApi={modelApi} contextType={PresetContext}
        modelContent={(model) =>
            <>
                <ItemContent>
                    <ItemTitle className="line-clamp-1">
                        {model.name} - {" "}
                        <span className="text-muted-foreground">{model.code}</span>
                    </ItemTitle>
                    <ItemDescription>{model.content.author}</ItemDescription>
                </ItemContent>
                <ItemContent className="flex-none text-center">
                    <ItemDescription>{model.version}</ItemDescription>
                </ItemContent>
            </>
        }
        cloneHandler={async (model, data) =>
            await post("/presets", {
                ...model, id: "",
                code: data.get("code") as string,
                name: data.get("name") as string,
            })}
        cloneContent={() =>
            <>
                <Field>
                    <Label htmlFor={`${modelType}-clone-code`}>{t("default.code") + "*"}</Label>
                    <Input id={`${modelType}-clone-code`} name="code" required/>
                </Field>
                <Field>
                    <Label htmlFor={`${modelType}-clone-name`}>{t("default.name") + "*"}</Label>
                    <Input id={`${modelType}-clone-name`} name="name" required/>
                </Field>
            </>}
        createHandler={async (data) =>
            await post("/presets", {
                id: "",
                version: "1.0.0",
                code: data.get("code") as string,
                name: data.get("name") as string,
                requires: [],
                tags: [],
                content: {
                    "author": "",
                    "description": ""
                },
            })}
        createContent={() =>
            <>
                <Field>
                    <Label htmlFor={`${modelType}-code`}>{t("default.code") + "*"}</Label>
                    <Input id={`${modelType}-code`} name="code"
                           required/>
                </Field>
                <Field>
                    <Label htmlFor={`${modelType}-name`}>{t("default.name") + "*"}</Label>
                    <Input id={`${modelType}-name`} name="name" required/>
                </Field>
            </>}
        tabManagerAccessor={() => presetTabManager}>
    </ModelListContentTemplate>;
}


export const tabConfig: TabConfig = {
    id: modelType,
    label: () => <ModelNavigationTemplate modelType={modelType}/>,
    component: Content
} as const;
