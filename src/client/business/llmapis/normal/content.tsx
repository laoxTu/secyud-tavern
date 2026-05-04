'use client';
import React from "react";
import {useTranslations} from "next-intl";
import {FileIcon} from "lucide-react";
import {Field, FieldLabel} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {put} from "@/client";
import {TabConfig} from "@/client/components/tab";
import {modelType} from "@/client/business/llmapis/context";
import {EntryNavigationTemplate} from "@/client/business/template/navigation-template";
import {EditFormTemplate} from "@/client/business/template/edit-form-template";
import {LlmapiContext} from "@/client/business/llmapis/context";
import {entryType} from "./context";

const prefix = `${modelType}-${entryType}`;

function Content() {
    const t = useTranslations();
    return <EditFormTemplate
        modelType={modelType}
        contextType={LlmapiContext}
        updateHandler={async (model, data) =>
            await put("/llmapis/{id}",
                {
                    content: {
                        "openingRemarks": data.get("openingRemarks") as string
                    },
                    name: data.get("name") as string,
                    version: data.get("version") as string,
                },
                {
                    params: {"id": model.id,}
                })}
        updateContent={(model) => <>
            <div className="grid grid-cols-2 gap-4">
                <Field>
                    <Label htmlFor={`${prefix}-code`}>{t("default.code") + "*"}</Label>
                    <Input id={`${prefix}-code`} name="code"
                           defaultValue={model.code} disabled/>
                </Field>
                <Field>
                    <FieldLabel htmlFor={`${prefix}-name`}>
                        {t("default.name")}
                    </FieldLabel>
                    <Input name="name" id={`${prefix}-name`}
                           defaultValue={model.name}
                    />
                </Field>
                <Field>
                    <FieldLabel htmlFor={`${prefix}-version`}>
                        {t("default.version")}
                    </FieldLabel>
                    <Input name="version"
                           id={`${prefix}-version`}
                           defaultValue={model.version}
                    />
                </Field>
            </div>
        </>}/>
}

export const tabConfig: TabConfig = {
    id: entryType,
    label: () => <EntryNavigationTemplate space="default" value="property" icon={FileIcon}/>,
    component: Content
}