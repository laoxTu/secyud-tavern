import {ReplaceIcon} from "lucide-react";
import React from "react";
import {useTranslations} from "next-intl";
import {del, post, put} from "@/client";
import {Field, FieldLabel} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {TabConfig} from "@/components/custom/tab";
import {TemplateEntryList} from "@/business/client/template";
import {EntryTabHeader} from "@/business/client/template/tab-header";
import {useItemState} from "@/modules/presets/client/models";
import {moduleName} from "@/modules/presets/models";
import {entryState} from "./models";
import {PresetRegexModel, engineName} from "../models";
import {Textarea} from "@/components/ui/textarea";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {submitTargetFormOnKey} from "@/business/client";

function Tab() {
    const t = useTranslations();
    const {model} = useItemState();
    return (
        <TemplateEntryList<PresetRegexModel>
            entryState={entryState}
            modelId={model!.id}
            createProps={{
                createHandler: async (data) => {
                    await post('/presets/{id}/entries/{entryType}', {
                        code: data.get('code'),
                        name: data.get('name'),
                        pattern: "",
                        replacement: "",
                        target: "both",
                    }, {
                        params: {
                            id: model?.id,
                            entryType: engineName,
                        }
                    })
                }
            }}
            updateProps={{
                disableHandler: async (entry, disabled) => {
                    await put('/presets/{id}/entries/{entryType}/{entryId}/disabled', {
                        disabled,
                    }, {
                        params: {
                            id: model?.id,
                            entryType: engineName,
                            entryId: entry.id
                        }
                    })
                    return {...entry, disabled};
                },
                deleteHandler: async entry => {
                    await del('/presets/{id}/entries/{entryType}/{entryId}', {
                        params: {
                            id: model?.id,
                            entryType: engineName,
                            entryId: entry.id
                        }
                    })
                },
                cloneHandler: async (entry, data) => {
                    await post('/presets/{id}/entries/{entryType}', {
                        ...entry,
                        code: data.get('code'),
                        name: data.get('name'),
                    }, {
                        params: {
                            id: model?.id,
                            entryType: engineName,
                        }
                    })
                },
                updateHandler: async (entry, data) => {
                    const result = {
                        ...entry,
                        pattern: data.get("pattern") as string,
                        replacement: data.get("replacement") as string,
                        target: data.get("target") as string,
                        code: data.get('code') as string,
                        name: data.get('name') as string,
                    }
                    await put('/presets/{id}/entries/{entryType}/{entryId}', result, {
                        params: {
                            id: model?.id,
                            entryType: engineName,
                            entryId: entry.id
                        }
                    });
                    return result;
                },
                updateContent: (entry) => (
                    <>
                        <div className="grid md:grid-cols-2 gap-4">
                            <Field>
                                <FieldLabel htmlFor={`${engineName}-target-${entry.id}`}>
                                    {t("regex.target")}
                                </FieldLabel>
                                <Select name="target" defaultValue={entry.target}>
                                    <SelectTrigger className="w-full" id={`${engineName}-target-${entry.id}`}>
                                        <SelectValue/>
                                    </SelectTrigger>
                                    <SelectContent position="popper">
                                        <SelectGroup>
                                            <SelectItem value={"both"}>
                                                {t(`regex.target_both`)}
                                            </SelectItem>
                                            <SelectItem value={"input"}>
                                                {t(`regex.target_input`)}
                                            </SelectItem>
                                            <SelectItem value={"output"}>
                                                {t(`regex.target_output`)}
                                            </SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </Field>
                        </div>
                        <Field>
                            <FieldLabel htmlFor={`${engineName}-pattern-${entry.id}`}>
                                {t("regex.pattern")}
                            </FieldLabel>
                            <Input name="pattern"
                                   id={`${engineName}-pattern-${entry.id}`}
                                   defaultValue={entry.pattern}/>
                        </Field>
                        <Field>
                            <FieldLabel htmlFor={`${engineName}-replacement-${entry.id}`}>
                                {t("regex.replacement")}
                            </FieldLabel>
                            <Textarea name="replacement"
                                      id={`${engineName}-replacement-${entry.id}`}
                                      defaultValue={entry.replacement}
                                      onKeyDown={submitTargetFormOnKey}/>
                        </Field>
                    </>)
            }}/>
    );
}

export const tabConfig: TabConfig = {
    id: engineName,
    label: () => <EntryTabHeader space={moduleName} value={engineName} icon={ReplaceIcon}/>,
    component: Tab
}