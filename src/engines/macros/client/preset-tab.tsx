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
import {TemplateEntryList} from "@/business/client/template";
import {entryState} from "./models";
import {del, post, put} from "@/client";
import {submitTargetFormOnKey} from "@/business/client";
import {Checkbox} from "@/components/ui/checkbox";
import {spanFull} from "@/components/custom/GridField";

function Tab() {
    const t = useTranslations();
    const {model} = useItemState();
    return (
        <TemplateEntryList<PresetMacroModel>
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
                            entryId: entry.id,
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
                            entryId: entry.id
                        }
                    });
                    return result;
                },
                updateContent: (entry) => (<>
                    <Field>
                        <FieldLabel htmlFor={`${engineName}-key-${entry.id}`}>
                            {t("macro.key")}
                        </FieldLabel>
                        <Input name="key"
                               id={`${engineName}-key-${entry.id}`}
                               defaultValue={entry.key}/>
                    </Field>
                    <Field>
                        <FieldLabel htmlFor={`${engineName}-multiple-${entry.id}`}>
                            {t("macro.multiple")}
                        </FieldLabel>
                        <FieldContent>
                            <Checkbox name="multiple"
                                      id={`${engineName}-multiple-${entry.id}`}
                                      defaultChecked={entry.multiple ?? false}/>
                        </FieldContent>
                    </Field>
                    <Field>
                        <FieldLabel htmlFor={`${engineName}-hidden-${entry.id}`}>
                            {t("macro.hidden")}
                        </FieldLabel>
                        <FieldContent>
                            <Checkbox name="hidden"
                                      id={`${engineName}-hidden-${entry.id}`}
                                      defaultChecked={entry.hidden ?? false}/>
                        </FieldContent>
                    </Field>
                    <Field className={spanFull}>
                        <FieldLabel htmlFor={`${engineName}-value-${entry.id}`}>
                            {t("macro.value")}
                        </FieldLabel>
                        <Textarea name="value"
                                  id={`${engineName}-value-${entry.id}`}
                                  defaultValue={entry.value}
                                  onKeyDown={submitTargetFormOnKey}/>
                    </Field>
                </>)
            }}/>
    );
}

export const tabConfig: TabConfig = {
    id: engineName,
    label: () => <EntryTabHeader space={moduleName} value={engineName} icon={ReplaceAllIcon}/>,
    component: Tab
}