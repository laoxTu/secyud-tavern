'use client';
import React from "react";
import {useTranslations} from "next-intl";
import {Field} from "@/components/ui/field";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {ItemContent, ItemDescription, ItemTitle} from "@/components/ui/item";
import {TabConfig} from "@/components/custom/tab";
import {ModelListContentTemplate} from "@/components/template/content-template";
import {ModelNavigationTemplate} from "@/components/template/navigation-template";
import {post} from "@/client";
import {PresetContext,} from "./models";
import {moduleName, moduleArrayName,PresetModel} from "../models";
import {presetTabManager} from "./tabs";


function Content() {
    const t = useTranslations();

    return <ModelListContentTemplate<PresetModel>
        modelType={moduleName} modelApi={moduleArrayName} contextType={PresetContext}
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
                    <Label htmlFor={`${moduleName}-clone-code`}>{t("default.code") + "*"}</Label>
                    <Input id={`${moduleName}-clone-code`} name="code" required/>
                </Field>
                <Field>
                    <Label htmlFor={`${moduleName}-clone-name`}>{t("default.name") + "*"}</Label>
                    <Input id={`${moduleName}-clone-name`} name="name" required/>
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
                    <Label htmlFor={`${moduleName}-code`}>{t("default.code") + "*"}</Label>
                    <Input id={`${moduleName}-code`} name="code"
                           required/>
                </Field>
                <Field>
                    <Label htmlFor={`${moduleName}-name`}>{t("default.name") + "*"}</Label>
                    <Input id={`${moduleName}-name`} name="name" required/>
                </Field>
            </>}
        tabManagerAccessor={() => presetTabManager}>
    </ModelListContentTemplate>;
}


export const presetNavigationContent: TabConfig = {
    id: moduleName,
    label: () => <ModelNavigationTemplate modelType={moduleName}/>,
    component: Content
} as const;
