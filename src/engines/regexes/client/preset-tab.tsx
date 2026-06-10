import React from "react";
import {ReplaceIcon} from "lucide-react";
import {useTranslations} from "next-intl";
import {Field, FieldLabel} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";
import {EntryNavigationTemplate} from "@/components/template/navigation-template";
import {EntryListTemplate} from "@/components/template/entry-list-template";
import {TabConfig} from "@/components/custom/tab";
import {PresetModel, moduleName, moduleArrayName} from "@/presets/models";
import {PresetContext} from "@/presets/client/models";
import {engineName, PresetRegexModel} from "../models";

function Tab() {
    const t = useTranslations();
    return (
        <EntryListTemplate<PresetModel>
            modelType={moduleName} modelApi={moduleArrayName} entryType={engineName} contextType={PresetContext}
            createAccessor={(): PresetRegexModel => ({
                id: 0,
                disabled: false,
                name: "",
                pattern: "",
                replacement: "",
                target: "both",
                layerMin: -1,
                layerMax: -1,
            })}
            updateAccessor={(data): Partial<PresetRegexModel> => ({
                name: data.get("name") as string,
                pattern: data.get("pattern") as string,
                replacement: data.get("replacement") as string,
                target: data.get("target") as string,
                layerMin: parseInt(data.get("layerMin") as string),
                layerMax: parseInt(data.get("layerMax") as string),
            })}
            updateContent={(entry:PresetRegexModel) => (
                <>
                    <div className="grid grid-cols-2 gap-4">
                        <Field>
                            <FieldLabel htmlFor={`${engineName}-name-${entry.id}`}>
                                {t("default.name")}
                            </FieldLabel>
                            <Input name="name"
                                   id={`${engineName}-name-${entry.id}`}
                                   defaultValue={entry.name}/>
                        </Field>
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

                    <div className="grid grid-cols-2 gap-4">
                        <Field>
                            <FieldLabel htmlFor={`${engineName}-layerMin-${entry.id}`}>
                                <Tooltip>
                                    <TooltipTrigger>
                                        {t("regex.layer_min")}
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{t("regex.unlimit_description")}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </FieldLabel>
                            <Input name="layerMin"
                                   type="number"
                                   id={`${engineName}-layerMin-${entry.id}`}
                                   defaultValue={entry.layerMin}/>
                        </Field>
                        <Field>
                            <FieldLabel htmlFor={`${engineName}-layerMax-${entry.id}`}>
                                <Tooltip>
                                    <TooltipTrigger>
                                        {t("regex.layer_max")}
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{t("regex.unlimit_description")}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </FieldLabel>
                            <Input name="layerMax"
                                   type="number"
                                   id={`${engineName}-layerMax-${entry.id}`}
                                   defaultValue={entry.layerMax}/>
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