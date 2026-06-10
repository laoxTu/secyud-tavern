import React from "react";
import {FileCode2Icon} from "lucide-react";
import {useTranslations} from "next-intl";
import {Field, FieldLabel} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {EntryNavigationTemplate} from "@/components/template/navigation-template";
import {EntryListTemplate} from "@/components/template/entry-list-template";
import {TabConfig} from "@/components/custom/tab";
import {PresetModel, moduleName, moduleArrayName} from "@/presets/models";
import {PresetContext} from "@/presets/client/models";
import {PresetScriptModel, engineName} from "../models";

function Tab() {
    const t = useTranslations();
    return (
        <EntryListTemplate<PresetModel>
            modelType={moduleName} modelApi={moduleArrayName} entryType={engineName} contextType={PresetContext}
            createAccessor={() => ({
                id: 0,
                disabled: false,
                name: "",
                content: "",
                priority: 100,
            })}
            updateAccessor={(data): Partial<PresetScriptModel> => ({
                name: data.get("name") as string,
                content: data.get("content") as string,
                priority: parseInt(data.get("priority") as string),
            })}
            updateContent={(entry: PresetScriptModel) => (
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
                            <FieldLabel htmlFor={`${engineName}-priority-${entry.id}`}>
                                {t("default.priority")}
                            </FieldLabel>
                            <Input name="priority" type={"number"}
                                   id={`${engineName}-priority-${entry.id}`}
                                   defaultValue={entry.priority}/>
                        </Field>
                    </div>
                    <Field>
                        <FieldLabel htmlFor={`${engineName}-content-${entry.id}`}>
                            {t("default.content")}
                        </FieldLabel>
                        <Textarea name="content"
                                  id={`${engineName}-content-${entry.id}`}
                                  defaultValue={entry.content}/>
                    </Field>
                </>
            )}/>
    );
}

export const tabConfig: TabConfig = {
    id: engineName,
    label: () => <EntryNavigationTemplate space={moduleName} value={engineName} icon={FileCode2Icon}/>,
    component: Tab
}