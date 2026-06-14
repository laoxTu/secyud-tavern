import React from "react";
import {ReplaceIcon} from "lucide-react";
import {useTranslations} from "next-intl";
import {Field, FieldLabel} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {EntryNavigationTemplate} from "@/components/template/navigation-template";
import {EntryListTemplate} from "@/components/template/entry-list-template";
import {TabConfig} from "@/components/custom/tab";
import {PresetModel, moduleName, moduleArrayName} from "@/presets/models";
import {PresetContext} from "@/presets/client/models";
import {engineName, PresetMacroModel} from "../models";
import {EntryModel} from "@/business/models";

function Tab() {
    const t = useTranslations();
    return (
        <EntryListTemplate<PresetModel>
            modelType={moduleName} modelApi={moduleArrayName} entryType={engineName} contextType={PresetContext}
            createAccessor={(): Omit<PresetMacroModel, keyof EntryModel> => ({
                key: "",
                value: ""
            })}
            updateAccessor={(data): Omit<PresetMacroModel, keyof EntryModel> => ({
                key: data.get("key") as string,
                value: data.get("value") as string,
            })}
            updateContent={(entry: PresetMacroModel) => (
                <>
                    <div className="grid grid-cols-2 gap-4">

                        <Field>
                            <FieldLabel htmlFor={`${engineName}-key-${entry.id}`}>
                                {t("macro.key")}
                            </FieldLabel>
                            <Input name="key"
                                   id={`${engineName}-key-${entry.id}`}
                                   defaultValue={entry.key}/>
                        </Field>
                        <Field>
                            <FieldLabel htmlFor={`${engineName}-value-${entry.id}`}>
                                {t("macro.value")}
                            </FieldLabel>
                            <Textarea name="value"
                                      id={`${engineName}-value-${entry.id}`}
                                      defaultValue={entry.value}/>
                        </Field>
                    </div>
                </>
            )}></EntryListTemplate>
    );
}

export const tabConfig: TabConfig = {
    id: engineName,
    label: () => <EntryNavigationTemplate space={moduleName} value={engineName} icon={ReplaceIcon}/>,
    component: Tab
}