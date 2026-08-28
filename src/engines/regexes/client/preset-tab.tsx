import {ReplaceIcon} from "lucide-react";
import React from "react";
import {useTranslations} from "next-intl";
import {del, post, put} from "@/client";
import {Field, FieldLabel} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {TabConfig} from "@/components/custom/tab";
import {EntryList} from "@/business/client/template/entry-list";
import {EntryTabHeader} from "@/business/client/template/tab-header";
import {useItemState} from "@/modules/presets/client/models";
import {moduleName} from "@/modules/presets/models";
import {entryState} from "./models";
import {engineName, PresetRegexModel} from "../models";
import {Textarea} from "@/components/ui/textarea";
import {submitTargetFormOnKey} from "@/business/client";
import {Selector} from "@/components/custom/selector";
import {spanHalf} from "@/components/custom/grid-field";
import {presetTabIsHide} from "@/modules/presets/client/tabs";

const regexTargets = ["both", "input", "output"]

function Tab() {
    const t = useTranslations();
    const {model} = useItemState();
    return (
        <EntryList<PresetRegexModel>
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
                            entryId: entry.entryId
                        }
                    })
                    return {...entry, disabled};
                },
                deleteHandler: async entry => {
                    await del('/presets/{id}/entries/{entryType}/{entryId}', {
                        params: {
                            id: model?.id,
                            entryType: engineName,
                            entryId: entry.entryId
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
                            entryId: entry.entryId
                        }
                    });
                    return result;
                },
                updateContent: (entry) => (
                    <>
                        <Field>
                            <FieldLabel htmlFor={`${engineName}-code-${entry.entryId}`}>
                                {t("default.code")}
                            </FieldLabel>
                            <Input name="code"
                                   id={`${engineName}-code-${entry.entryId}`}
                                   defaultValue={entry.code ?? ""}/>
                        </Field>
                        <Field>
                            <FieldLabel htmlFor={`${engineName}-name-${entry.entryId}`}>
                                {t("default.name")}
                            </FieldLabel>
                            <Input name="name"
                                   id={`${engineName}-name-${entry.entryId}`}
                                   defaultValue={entry.name ?? ""}/>
                        </Field>
                        <Field className={spanHalf + " row-span-8"}>
                            <FieldLabel htmlFor={`${engineName}-replacement-${entry.entryId}`}>
                                {t("regex.replacement")}
                            </FieldLabel>
                            <Textarea name="replacement"
                                      id={`${engineName}-replacement-${entry.entryId}`}
                                      defaultValue={entry.replacement}
                                      onKeyDown={submitTargetFormOnKey}/>
                        </Field>
                        <Field>
                            <FieldLabel htmlFor={`${engineName}-target-${entry.entryId}`}>
                                {t("regex.target")}
                            </FieldLabel>
                            <Selector name={'target'} id={`${engineName}-target-${entry.entryId}`}
                                      defaultValue={entry.target ?? null}
                                      items={regexTargets}
                                      labelAccessor={e => t(`regex.target_${e}`)}/>
                        </Field>
                        <Field className={spanHalf}>
                            <FieldLabel htmlFor={`${engineName}-pattern-${entry.entryId}`}>
                                {t("regex.pattern")}
                            </FieldLabel>
                            <Input name="pattern"
                                   id={`${engineName}-pattern-${entry.entryId}`}
                                   defaultValue={entry.pattern}/>
                        </Field>
                    </>)
            }}/>
    );
}

export const tabConfig: TabConfig = {
    id: engineName,
    hide: async () => presetTabIsHide(engineName),
    label: () => <EntryTabHeader space={moduleName} value={engineName} icon={ReplaceIcon}/>,
    component: Tab
}