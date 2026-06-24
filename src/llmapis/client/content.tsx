'use client';
import React from "react";
import {useTranslations} from "next-intl";
import {Field} from "@/components/ui/field";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {ItemContent, ItemDescription, ItemTitle} from "@/components/ui/item";
import {del, get, open, post} from "@/client";
import {TabConfig} from "@/components/custom/tab";
import {LlmapiModel, moduleName} from "../models";
import {llmapiTabManager} from "./tabs";
import {ModelTabHeader} from "@/business/client/template/tab-header";
import {TemplateModelList} from "@/business/client/template";
import {modelState} from "./models";

function Content() {
    const t = useTranslations();
    return <TemplateModelList<LlmapiModel>
        modelState={modelState}
        itemContent={(model) =>
            <>
                <ItemContent>
                    <ItemTitle className="line-clamp-1">
                        {model.name} - <span
                        className={"text-muted-foreground"}> {model.code} </span>
                    </ItemTitle>
                    <ItemDescription>{model.content.author}</ItemDescription>
                </ItemContent>
            </>
        }
        createProps={{
            importAccept: ".json",
            importHandler: async (file) => {
                return await post("/llmapis/import", file, {
                    headers: {
                        'Content-Type': "application/octet-stream"
                    }
                })
            },
            createContent: () => (<>
                <Field>
                    <Label htmlFor={`${moduleName}-code`}>{t("default.code") + "*"}</Label>
                    <Input id={`${moduleName}-code`} name="code" required/>
                </Field>
                <Field>
                    <Label htmlFor={`${moduleName}-name`}>{t("default.name") + "*"}</Label>
                    <Input id={`${moduleName}-name`} name="name" required/>
                </Field>
            </>),
            createHandler: async (data) => {
                return await post("/llmapis", {
                    id: "",
                    code: data.get("code") as string,
                    name: data.get("name") as string,
                    version: "1.0.0",
                    content: {}
                });
            }
        }}
        contentProps={{
            cloneHandler: async (model, data) => {
                const entity = await get("/llmapis/{id}", {
                    params: {
                        id: model.id,
                        withDetails: true
                    }
                });
                return await post("/llmapis", {
                    ...entity, id: "",
                    code: data.get("code") as string,
                    name: data.get("name") as string,
                })
            },
            cloneContent: () => (<>
                <Field>
                    <Label htmlFor={`${moduleName}-clone-code`}>{t("default.code") + "*"}</Label>
                    <Input id={`${moduleName}-clone-code`} name="code" required/>
                </Field>
                <Field>
                    <Label htmlFor={`${moduleName}-clone-name`}>{t("default.name") + "*"}</Label>
                    <Input id={`${moduleName}-clone-name`} name="name" required/>
                </Field>
            </>),
            exportHandler: async (model) => {
                await open('/llmapis/{id}/export', {
                    params: {
                        id: model.id,
                    }
                });
            },
            deleteHandler: async (model) => {
                await del('/llmapis/{id}', {
                    params: {
                        id: model.id,
                    }
                });
            },
            tabManager: llmapiTabManager
        }}>
    </TemplateModelList>;
}


export const llmapiNavigationContent: TabConfig = {
    id: moduleName,
    label: () => <ModelTabHeader modelType={moduleName}/>,
    component: Content
} as const;
