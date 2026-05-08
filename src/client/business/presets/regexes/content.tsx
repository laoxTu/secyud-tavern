import React from "react";
import {ReplaceIcon} from "lucide-react";
import {useTranslations} from "next-intl";
import {Field, FieldLabel} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";
import {EntryNavigationTemplate} from "@/client/business/template/navigation-template";
import {EntryListTemplate} from "@/client/business/template/entry-list-template";
import {TabConfig} from "@/client/components/tab";
import {PresetModel, name as modelType} from "@/shared/business/presets";
import {modelApi, PresetContext} from "../context";
import {entryType} from "./context";

function Content() {
    const t = useTranslations();
    return (
        <EntryListTemplate<PresetModel>
            modelType={modelType} modelApi={modelApi} entryType={entryType} contextType={PresetContext}
            createAccessor={() => ({
                pattern: "",
                replacement: "",
                target: "both",
                layerMin: -1,
                layerMax: -1,
            })}
            updateAccessor={data => ({
                pattern: data.get("pattern") as string,
                replacement: data.get("replacement") as string,
                target: data.get("target") as string,
                layerMin: parseInt(data.get("layerMin") as string),
                layerMax: parseInt(data.get("layerMax") as string),
            })}
            updateContent={entry => (
                <>
                    <div className="grid grid-cols-2 gap-4">
                        <Field>
                            <FieldLabel htmlFor={`${entryType}-name-${entry.id}`}>
                                {t("default.name")}
                            </FieldLabel>
                            <Input name="name"
                                   id={`${entryType}-name-${entry.id}`}
                                   defaultValue={entry.name}/>
                        </Field>
                        <Field>
                            <FieldLabel htmlFor={`${entryType}-target-${entry.id}`}>
                                {t("regex.target")}
                            </FieldLabel>
                            <Select name="target" defaultValue={entry.target}>
                                <SelectTrigger className="w-full" id={`${entryType}-target-${entry.id}`}>
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
                        <FieldLabel htmlFor={`${entryType}-pattern-${entry.id}`}>
                            {t("regex.pattern")}
                        </FieldLabel>
                        <Input name="pattern"
                               id={`${entryType}-pattern-${entry.id}`}
                               defaultValue={entry.pattern}/>
                    </Field>
                    <Field>
                        <FieldLabel htmlFor={`${entryType}-replacement-${entry.id}`}>
                            {t("regex.replacement")}
                        </FieldLabel>
                        <Textarea name="replacement"
                                  id={`${entryType}-replacement-${entry.id}`}
                                  defaultValue={entry.replacement}/>
                    </Field>

                    <div className="grid grid-cols-2 gap-4">
                        <Field>
                            <FieldLabel htmlFor={`${entryType}-layerMin-${entry.id}`}>
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
                                   id={`${entryType}-layerMin-${entry.id}`}
                                   defaultValue={entry.layerMin}/>
                        </Field>
                        <Field>
                            <FieldLabel htmlFor={`${entryType}-layerMax-${entry.id}`}>
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
                                   id={`${entryType}-layerMax-${entry.id}`}
                                   defaultValue={entry.layerMax}/>
                        </Field>
                    </div>
                </>
            )}></EntryListTemplate>
    );
}

export const tabConfig: TabConfig = {
    id: entryType,
    label: () => <EntryNavigationTemplate space={modelType} value={entryType} icon={ReplaceIcon}/>,
    component: Content
}