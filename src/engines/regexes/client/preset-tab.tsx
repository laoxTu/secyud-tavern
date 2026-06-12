import React from "react";
import {ReplaceIcon} from "lucide-react";
import {useTranslations} from "next-intl";
import {Field, FieldLabel} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {EntryNavigationTemplate} from "@/components/template/navigation-template";
import {EntryListTemplate} from "@/components/template/entry-list-template";
import {TabConfig} from "@/components/custom/tab";
import {PresetModel, moduleName, moduleArrayName} from "@/presets/models";
import {PresetContext} from "@/presets/client/models";
import {engineName, PresetRegexModel} from "../models";
import {EntryModel} from "@/business/models";

function Tab() {
    const t = useTranslations();
    return (
        <EntryListTemplate<PresetModel>
            modelType={moduleName} modelApi={moduleArrayName} entryType={engineName} contextType={PresetContext}
            createAccessor={(): Omit<PresetRegexModel, keyof EntryModel> => ({
                pattern: "",
                replacement: "",
                target: "both",
            })}
            updateAccessor={(data): Omit<PresetRegexModel, keyof EntryModel> => ({
                pattern: data.get("pattern") as string,
                replacement: data.get("replacement") as string,
                target: data.get("target") as string,
            })}
            updateContent={(entry: PresetRegexModel) => (
                <>
                    <div className="grid grid-cols-2 gap-4">
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
                                  defaultValue={entry.replacement}/>
                    </Field>
                </>
            )}></EntryListTemplate>
    );
}

export const tabConfig: TabConfig = {
    id: engineName,
    label: () => <EntryNavigationTemplate space={moduleName} value={engineName} icon={ReplaceIcon}/>,
    component: Tab
}