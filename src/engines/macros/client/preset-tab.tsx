import React from "react";
import {ReplaceAllIcon} from "lucide-react";
import {useTranslations} from "next-intl";
import {Field, FieldContent, FieldLabel} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {TabConfig} from "@/components/custom/tab";
import {moduleName} from "@/modules/presets/models";
import {engineName, PresetMacroModel} from "../models";
import {useItemState} from "@/modules/presets/client/models";
import {EntryTabHeader} from "@/business/client/template/tab-header";
import {EntryList} from "@/business/client/template/entry-list";
import {entryState} from "./models";
import {del, post, put} from "@/client";
import {submitTargetFormOnKey} from "@/business/client";
import {Checkbox} from "@/components/ui/checkbox";
import {spanHalf} from "@/components/custom/grid-field";
import {presetTabIsHide} from "@/modules/presets/client/tabs";

function Tab() {
    const t = useTranslations();
    const {model} = useItemState();
    return (
        <EntryList<PresetMacroModel>
            entryState={entryState}
            modelId={model!.id}
            createProps={{
                createHandler: async (data) => {
                    await post('/presets/{id}/entries/{entryType}', {
                        code: data.get('code'),
                        name: data.get('name'),
                        key: "",
                        value: ""
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
                            entryId: entry.entryId,
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
                        key: data.get("key") as string,
                        value: data.get("value") as string,
                        code: data.get('code') as string,
                        name: data.get('name') as string,
                        multiple: !!data.get('multiple'),
                        hidden: !!data.get('hidden'),
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
                updateContent: (entry) => (<>
                    <Field className={spanHalf + " row-span-8"}>
                        <FieldLabel htmlFor={`${engineName}-value-${entry.entryId}`}>
                            {t("macro.value")}
                        </FieldLabel>
                        <Textarea name="value"
                                  id={`${engineName}-value-${entry.entryId}`}
                                  defaultValue={entry.value}
                                  onKeyDown={submitTargetFormOnKey}/>
                    </Field>
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
                    <Field>
                        <FieldLabel htmlFor={`${engineName}-key-${entry.entryId}`}>
                            {t("macro.key")}
                        </FieldLabel>
                        <Input name="key"
                               id={`${engineName}-key-${entry.entryId}`}
                               defaultValue={entry.key}/>
                    </Field>
                    <Field>
                        <FieldLabel htmlFor={`${engineName}-multiple-${entry.entryId}`}>
                            {t("macro.multiple")}
                        </FieldLabel>
                        <FieldContent>
                            <Checkbox name="multiple"
                                      id={`${engineName}-multiple-${entry.entryId}`}
                                      defaultChecked={entry.multiple ?? false}/>
                        </FieldContent>
                    </Field>
                    <Field>
                        <FieldLabel htmlFor={`${engineName}-hidden-${entry.entryId}`}>
                            {t("default.hidden")}
                        </FieldLabel>
                        <FieldContent>
                            <Checkbox name="hidden"
                                      id={`${engineName}-hidden-${entry.entryId}`}
                                      defaultChecked={entry.hidden ?? false}/>
                        </FieldContent>
                    </Field>
                </>)
            }}/>
    );
}

export const tabConfig: TabConfig = {
    id: engineName,
    hide: async () => presetTabIsHide(engineName),
    label: () => <EntryTabHeader space={moduleName} value={engineName} icon={ReplaceAllIcon}/>,
    component: Tab
}