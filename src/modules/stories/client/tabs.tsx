'use client';
import React from "react";
import {useTranslations} from "next-intl";
import {FileIcon} from "lucide-react";
import {put} from "@/client";
import {ModelUpdate} from "@/business/client/template/model-update";
import {Field, FieldLabel} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {TabManager} from "@/components/custom/tab";
import {tryParseJson} from "@/utils";
import {moduleName, StoryModel} from "../models";
import {modelState} from "./models";
import {EntryTabHeader} from "@/business/client/template/tab-header";
import {getPresetRequires, PresetRequiresField} from "@/modules/presets/client/tabs";
import {LlmapiRequireField} from "@/modules/llmapis/client/tabs";

function Tab() {
    const t = useTranslations();
    return <ModelUpdate<StoryModel>
        modelState={modelState}
        props={{
            updateHandler: async (model, data) => {
                await put("/stories/{id}", {
                        content: {},
                        name: data.get("name") as string,
                        requires: getPresetRequires(data),
                        llmapi: tryParseJson(data.get("llmapi") as string),
                    },
                    {
                        params: {"id": model.id,}
                    });
            },
            updateContent: (model) => (<>
                <Field>
                    <FieldLabel htmlFor={`${moduleName}-name`}>
                        {t("default.name")}
                    </FieldLabel>
                    <Input name="name" id={`${moduleName}-name`}
                           defaultValue={model.name}/>
                </Field>
                <LlmapiRequireField defaultValue={model.llmapi ?? null}/>
                <PresetRequiresField defaultValue={model.requires}/>
            </>)
        }}/>
}

export const storyTabManager = new TabManager("story tabs", {
    id: 'default',
    label: () => <EntryTabHeader space="default" value="property" icon={FileIcon}/>,
    component: Tab
});