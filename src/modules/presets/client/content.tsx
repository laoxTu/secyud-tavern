'use client';
import React from "react";
import Image from "next/image"
import {useTranslations} from "next-intl";
import {Field} from "@/components/ui/field";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {ItemContent, ItemDescription, ItemMedia, ItemTitle} from "@/components/ui/item";
import {TabConfig} from "@/components/custom/tab";
import {get, post, open, del} from "@/client";
import {moduleName, PresetModel} from "../models";
import {presetTabManager} from "./tabs";
import {getAuthor} from "@/business/client/author";
import {TemplateModelList} from "@/business/client/template";
import {ModelTabHeader} from "@/business/client/template/tab-header";
import {defaultTags, modelState} from "@/modules/presets/client/models";
import {createUseTabState} from "@/business/client/models";
import {TagBox} from "@/components/custom/combobox";

export const usePresetTabState = createUseTabState(presetTabManager);

function Content() {
    const t = useTranslations();
    return <TemplateModelList<PresetModel>
        modelState={modelState}
        searchAccessor={data => ({
            tags: data.getAll("tag") as string[]
        })}
        searchContent={() => {
            return (<>
                <TagBox defaultValue={[]}
                        name={"tag"}
                        placeholder={t("default.tags")}
                        items={defaultTags}/>
            </>);
        }}
        itemContent={(model) =>
            <>
                <ItemMedia variant={'image'}>
                    <Image
                        src={model.content.coverId ? `/api/images/${model.content.coverId}` : "/images/default_cover.png"}
                        alt={model.name}
                        width={32}
                        height={32}
                        className="object-contain"
                    />
                </ItemMedia>
                <ItemContent>
                    <ItemTitle className="line-clamp-1">
                        {model.name} - <span className="text-muted-foreground">{model.code}</span>
                    </ItemTitle>
                    <ItemDescription>{model.content.author}</ItemDescription>
                </ItemContent>
                <ItemContent className="flex-none text-center">
                    <ItemDescription>{model.version}</ItemDescription>
                </ItemContent>
            </>
        }
        createProps={{
            importAccept: ".json,.png",
            importHandler: async (file) => {
                return await post("/presets/import", file, {
                    headers: {
                        'Content-Type': "image/png"
                    }
                })
            },
            createContent: () => (<>
                <Field>
                    <Label htmlFor={`${moduleName}-code`}>{t("default.code") + "*"}</Label>
                    <Input id={`${moduleName}-code`} name="code"
                           required/>
                </Field>
                <Field>
                    <Label htmlFor={`${moduleName}-name`}>{t("default.name") + "*"}</Label>
                    <Input id={`${moduleName}-name`} name="name" required/>
                </Field>
            </>),
            createHandler: async (data) => {
                return await post("/presets", {
                    id: "",
                    version: "1.0.0",
                    code: data.get("code") as string,
                    name: data.get("name") as string,
                    requires: [],
                    tags: [],
                    content: {
                        "author": getAuthor(t),
                        "description": ""
                    },
                });
            }
        }}
        contentProps={{
            cloneHandler:
                async (model, data) => {
                    const entity = await get("/presets/{id}", {
                        params: {
                            id: model.id,
                            withDetails: true
                        }
                    });
                    return await post("/presets", {
                        ...entity, id: "",
                        code: data.get("code") as string,
                        name: data.get("name") as string,
                    })
                },
            cloneContent: (model) => (<>
                <Field>
                    <Label htmlFor={`${moduleName}-clone-code`}>{t("default.code") + "*"}</Label>
                    <Input id={`${moduleName}-clone-code`}
                           defaultValue={model.code}
                           name="code" required/>
                </Field>
                <Field>
                    <Label htmlFor={`${moduleName}-clone-name`}>{t("default.name") + "*"}</Label>
                    <Input id={`${moduleName}-clone-name`}
                           defaultValue={model.name}
                           name="name" required/>
                </Field>
            </>),
            exportHandler: async (model) => {
                await open('/presets/{id}/export', {
                    params: {
                        id: model.id,
                    }
                });
            },
            deleteHandler: async (model) => {
                await del('/presets/{id}', {
                    params: {
                        id: model.id,
                    }
                });
            },
            useTabState: usePresetTabState,
            tabManager: presetTabManager
        }}>
    </TemplateModelList>;
}


export const presetNavigationContent: TabConfig = {
    id: moduleName,
    label: () => <ModelTabHeader modelType={moduleName}/>,
    component: Content
} as const;
