'use client';
import React from "react";
import {useTranslations} from "next-intl";
import {FileIcon} from "lucide-react";
import {Field, FieldLabel} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {put} from "@/client";
import {TabConfig} from "@/client/components/tab";
import {modelType} from "@/client/business/stories/context";
import {EntryNavigationTemplate} from "@/client/business/template/navigation-template";
import {EditFormTemplate} from "@/client/business/template/edit-form-template";
import {StoryContext} from "@/client/business/stories/context";
import {PresetCombobox} from "@/client/business/presets/preset-combobox";
import {entryType} from "./context";
import {LlmapiCombobox} from "@/client/business/llmapis/llmapi-combobox";
import {tryParseJson} from "@/shared/utils";

const prefix = `${modelType}-${entryType}`;

function Content() {
    const t = useTranslations();
    return <EditFormTemplate
        modelType={modelType}
        contextType={StoryContext}
        updateHandler={async (model, data) =>
            await put("/stories/{id}",
                {
                    content: {
                        "openingRemarks": data.get("openingRemarks") as string
                    },
                    name: data.get("name") as string,
                    requires: data.getAll("require").map(u => JSON.parse(u as string)),
                    llmapi: tryParseJson(data.get("llmapi") as string),
                },
                {
                    params: {"id": model.id,}
                })}
        updateContent={(model) => <>
            <div className="grid grid-cols-2 gap-4">
                <Field>
                    <FieldLabel htmlFor={`${prefix}-name`}>
                        {t("default.name")}
                    </FieldLabel>
                    <Input name="name" id={`${prefix}-name`}
                           defaultValue={model.name}/>
                </Field>
                <Field>
                    <FieldLabel htmlFor={`${prefix}-llmapi`}>
                        {t("default.llmapi")}
                    </FieldLabel>
                    <LlmapiCombobox name={"llmapi"} id={`${prefix}-llmapi`}
                                    defaultValue={model.llmapi}/>
                </Field>
                <Field>
                    <FieldLabel htmlFor={`${prefix}-requires`}>
                        {t("default.requires")}
                    </FieldLabel>
                    <PresetCombobox name={"require"} id={`${prefix}-requires`}
                                    defaultValue={model.requires}/>
                </Field>
            </div>
            <Field>
                <FieldLabel htmlFor={`${prefix}-opening_remarks`}>
                    {t("story.opening_remarks")}
                </FieldLabel>
                <Textarea name="openingRemarks" id={`${prefix}-opening_remarks`}
                          defaultValue={model.content.openingRemarks ?? ""}
                />
            </Field>
        </>}/>
}

export const tabConfig: TabConfig = {
    id: entryType,
    label: () => <EntryNavigationTemplate space="default" value="property" icon={FileIcon}/>,
    component: Content
}