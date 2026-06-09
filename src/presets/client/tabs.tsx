'use client';
import {moduleName} from "../models";
import React from "react";
import {useTranslations} from "next-intl";
import {FileIcon} from "lucide-react";
import {put} from "@/client";
import {Field, FieldLabel} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {TabManager} from "@/components/custom/tab";
import {CustomCombobox} from "@/components/custom/combobox/component";
import {EditFormTemplate} from "@/components/template/edit-form-template";
import {EntryNavigationTemplate} from "@/components/template/navigation-template";
import {PresetCombobox} from "./combobox";
import {moduleName as modelType} from "../models";
import {PresetContext} from "./models";

const prefix = modelType;

export const defaultTags = [
    "theme", "story", "preset"
];

export function DefaultTab() {
    const t = useTranslations();
    return <EditFormTemplate
        modelType={modelType}
        contextType={PresetContext}
        updateHandler={async (model, data) =>
            await put("/presets/{id}",
                {
                    content: {
                        "description": data.get("description") as string
                    },
                    version: data.get("version") as string,
                    name: data.get("name") as string,
                    requires: data.getAll("require").map(u => JSON.parse(u as string)),
                    tags: data.getAll("tag") as string[],
                },
                {
                    params: {"id": model.id,}
                })}
        updateContent={(model) => <>
            <div className="grid grid-cols-2 gap-4">
                <Field>
                    <FieldLabel htmlFor={`${prefix}-code`}>
                        {t("default.code")}
                    </FieldLabel>
                    <Input disabled name="code" id={`${prefix}-code`}
                           defaultValue={model.code}/>
                </Field>
                <Field>
                    <FieldLabel htmlFor={`${prefix}-author`}>
                        {t("default.author")}
                    </FieldLabel>
                    <Input disabled name="author" id={`${prefix}-author`}
                           defaultValue={model.content.author}/>
                </Field>
                <Field>
                    <FieldLabel htmlFor={`${prefix}-name`}>
                        {t("default.name")}
                    </FieldLabel>
                    <Input name="name" id={`${prefix}-name`}
                           defaultValue={model.name}/>
                </Field>
                <Field>
                    <FieldLabel htmlFor={`${prefix}-version`}>
                        {t("default.version")}
                    </FieldLabel>
                    <Input name="version" id={`${prefix}-version`}
                           defaultValue={model.version}/>
                </Field>
                <Field>
                    <FieldLabel htmlFor={`${prefix}-tags`}>
                        {t("default.tags")}
                    </FieldLabel>
                    <CustomCombobox defaultValue={model.tags} name={"tag"}
                                    id={`${prefix}-tags`} extraValue={defaultTags}/>
                </Field>
                <Field>
                    <FieldLabel htmlFor={`${prefix}-requires`}>
                        {t("default.requires")}
                    </FieldLabel>
                    <PresetCombobox
                        id={`${prefix}-requires`} name={"require"}
                        defaultValue={model.requires}/>
                </Field>
            </div>
            <Field>
                <FieldLabel htmlFor={`${prefix}-description`}>
                    {t("default.description")}
                </FieldLabel>
                <Textarea name="description" id={`${prefix}-description`}
                          defaultValue={model.content.description ?? ""}/>
            </Field>
        </>}/>
}

export const presetTabManager = new TabManager(moduleName, {
    id: 'default',
    label: () => <EntryNavigationTemplate space="default" value="property" icon={FileIcon}/>,
    component: DefaultTab
});