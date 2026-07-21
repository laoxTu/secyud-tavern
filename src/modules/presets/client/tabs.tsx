'use client';
import React, {useRef, useState} from "react";
import {useTranslations} from "next-intl";
import {FileIcon} from "lucide-react";
import {get, post, put} from "@/client";
import {Field, FieldLabel} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {TabManager} from "@/components/custom/tab";
import {RemoteSearchCombobox, TagBox} from "@/components/custom/combobox";
import {ImageUploader} from "@/components/custom/image-uploader";
import {BusinessError} from "@/handler/models";
import {TemplateModelUpdate} from "@/business/client/template";
import {EntryTabHeader} from "@/business/client/template/tab-header";
import {moduleName, PresetModel} from "../models";
import {defaultTags, modelState} from "./models";
import {submitTargetFormOnKey} from "@/business/client";
import {PagedResult} from "@/business/models";
import {useErrorHandler} from "@/handler/client/error";


export function DefaultTab() {
    const t = useTranslations();
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const changed = useRef(false);
    const {handleError} = useErrorHandler();
    return <TemplateModelUpdate<PresetModel>
        modelState={modelState}
        props={{
            updateHandler: async (model, data) => {
                let coverId: string | null = null;
                if (!changed.current) {
                    coverId = model.content.coverId
                } else if (coverFile) {
                    if (coverFile.type !== "image/png") {
                        throw new BusinessError("Only png file supported.")
                    }

                    const {id} = await post('/images', coverFile, {
                        headers: {
                            'Content-Type': coverFile.type
                        }
                    });
                    coverId = id;
                }
                console.debug("[cover id]", coverId);

                return await put("/presets/{id}",
                    {
                        content: {
                            "description": data.get("description") as string,
                            coverId
                        },
                        version: data.get("version") as string,
                        name: data.get("name") as string,
                        code: model.code,
                        requires: data.getAll("require")
                            .map(u => JSON.parse(u as string)),
                        tags: data.getAll("tag") as string[],
                    },
                    {
                        params: {"id": model.id,}
                    });
            },
            updateContent: (model) => (<>
                <Field>
                    <FieldLabel htmlFor={`${moduleName}-cover`}>
                        {t("default.cover")}
                    </FieldLabel>
                    <ImageUploader name="cover`" id={`${moduleName}-cover`} className={'max-w-52'}
                                   accept={"image/png"}
                                   defaultValue={model.content.coverId ? `/api/images/${model.content.coverId}` : undefined}
                                   onChange={file => {
                                       console.debug("file", file);
                                       setCoverFile(file);
                                       changed.current = true;
                                   }}/>
                </Field>
                <div className="grid md:grid-cols-2 gap-4">
                    <Field>
                        <FieldLabel htmlFor={`${moduleName}-code`}>
                            {t("default.code")}
                        </FieldLabel>
                        <Input name="code" id={`${moduleName}-code`}
                               disabled defaultValue={model.code}/>
                    </Field>
                    <Field>
                        <FieldLabel htmlFor={`${moduleName}-author`}>
                            {t("default.author")}
                        </FieldLabel>
                        <Input disabled name="author" id={`${moduleName}-author`}
                               defaultValue={model.content.author}/>
                    </Field>
                    <Field>
                        <FieldLabel htmlFor={`${moduleName}-name`}>
                            {t("default.name")}
                        </FieldLabel>
                        <Input name="name" id={`${moduleName}-name`}
                               defaultValue={model.name}/>
                    </Field>
                    <Field>
                        <FieldLabel htmlFor={`${moduleName}-version`}>
                            {t("default.version")}
                        </FieldLabel>
                        <Input name="version" id={`${moduleName}-version`}
                               defaultValue={model.version}/>
                    </Field>
                    <Field>
                        <FieldLabel htmlFor={`${moduleName}-tags`}>
                            {t("default.tags")}
                        </FieldLabel>
                        <TagBox defaultValue={model.tags} name={"tag"}
                                id={`${moduleName}-tags`} items={defaultTags}/>
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
                    <FieldLabel htmlFor={`${moduleName}-description`}>
                        {t("default.description")}
                    </FieldLabel>
                    <Textarea name="description" id={`${moduleName}-description`}
                              defaultValue={model.content.description ?? ""}
                              onKeyDown={submitTargetFormOnKey}/>
                </Field>
            </>)
        }}/>
}

export const presetTabManager = new TabManager(moduleName, {
    id: 'default',
    label: () => <EntryTabHeader space="default" value="property" icon={FileIcon}/>,
    component: DefaultTab
});