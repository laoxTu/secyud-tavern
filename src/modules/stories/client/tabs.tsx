'use client';
import React from "react";
import {useTranslations} from "next-intl";
import {FileIcon} from "lucide-react";
import {get, put} from "@/client";
import {ModelUpdate} from "@/business/client/template/model-update";
import {Field, FieldLabel} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {TabManager} from "@/components/custom/tab";
import {tryParseJson} from "@/utils";
import {moduleName, StoryModel} from "../models";
import {modelState} from "./models";
import {EntryTabHeader} from "@/business/client/template/tab-header";
import {submitTargetFormOnKey} from "@/business/client";
import {RemoteSearchCombobox} from "@/components/custom/combobox";
import {PagedResult} from "@/business/models";
import {PresetModel} from "@/modules/presets/models";
import {useErrorHandler} from "@/handler/client/error";
import {LlmapiModel} from "@/modules/llmapis/models";


function Tab() {
    const t = useTranslations();
    const {handleError} = useErrorHandler();
    return <ModelUpdate<StoryModel>
        modelState={modelState}
        props={{
            updateHandler: async (model, data) => {
                return await put("/stories/{id}",
                    {
                        content: {
                            "openingRemarks": data.get("openingRemarks") as string
                        },
                        name: data.get("name") as string,
                        requires: data.getAll("require")
                            .map(u => JSON.parse(u as string)),
                        llmapi: tryParseJson(data.get("llmapi") as string),
                    },
                    {
                        params: {"id": model.id,}
                    });
            },
            updateContent: (model) => (<>
                <div className="grid md:grid-cols-2 gap-4">
                    <Field>
                        <FieldLabel htmlFor={`${moduleName}-name`}>
                            {t("default.name")}
                        </FieldLabel>
                        <Input name="name" id={`${moduleName}-name`}
                               defaultValue={model.name}/>
                    </Field>
                    <Field>
                        <FieldLabel htmlFor={`${moduleName}-llmapi`}>
                            {t("default.llmapi")}
                        </FieldLabel>

                        <RemoteSearchCombobox
                            name={`llmapi`} id={`${moduleName}-llmapi`}
                            defaultValue={model.llmapi ?? null}
                            comparer={(u, v) => u.code === v.code}
                            labelAccessor={e => `${e.code}-${e.version}`}
                            valueAccessor={e => `${e.code}-${e.version}`}
                            searchHandler={async (search: string | null) => {
                                try {
                                    const res = await get("/llmapis", {
                                        params: {
                                            search: {
                                                fuzzy: search,
                                            },
                                        }
                                    }) as PagedResult<LlmapiModel>;
                                    return res.data.map(u => ({
                                        code: u.code,
                                        version: u.version,
                                    }));
                                } catch (e) {
                                    handleError(e);
                                }
                            }}/>
                    </Field>
                    <Field>
                        <FieldLabel htmlFor={`${moduleName}-requires`}>
                            {t("default.requires")}
                        </FieldLabel>
                        <RemoteSearchCombobox
                            multiple name={`require`} id={`${moduleName}-requires`}
                            defaultValue={model.requires ?? []}
                            comparer={(u, v) => u.code === v.code}
                            labelAccessor={e => `${e.code}-${e.version}`}
                            valueAccessor={e => `${e.code}-${e.version}`}
                            searchHandler={async (search: string | null) => {
                                try {
                                    const res = await get("/presets", {
                                        params: {
                                            search: {
                                                fuzzy: search
                                            },
                                        }
                                    }) as PagedResult<PresetModel>;
                                    return res.data.map(u => ({
                                        code: u.code,
                                        version: u.version,
                                    }));
                                } catch (e) {
                                    handleError(e);
                                }
                            }}/>
                    </Field>
                </div>
                <Field>
                    <FieldLabel htmlFor={`${moduleName}-opening_remarks`}>
                        {t("story.opening_remarks")}
                    </FieldLabel>
                    <Textarea name="openingRemarks" id={`${moduleName}-opening_remarks`}
                              defaultValue={model.content.openingRemarks ?? ""}
                              onKeyDown={submitTargetFormOnKey}
                    />
                </Field>
            </>)
        }}/>
}

export const storyTabManager = new TabManager("story tabs", {
    id: 'default',
    label: () => <EntryTabHeader space="default" value="property" icon={FileIcon}/>,
    component: Tab
});