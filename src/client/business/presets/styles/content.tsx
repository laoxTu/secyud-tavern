import {PaletteIcon} from "lucide-react";
import React from "react";
import {useTranslations} from "next-intl";
import {Field, FieldLabel} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {EntryNavigationTemplate} from "@/client/business/template/navigation-template";
import {EntryListTemplate} from "@/client/business/template/entry-list-template";
import {TabConfig} from "@/client/components/tab";
import {PresetModel, name as modelType} from "@/shared/business/presets";
import {modelApi, PresetContext} from "../context";
import {entryType} from "./context";
import {PresetStyleModel} from "@/shared/business/presets/styles/models";

function Content() {
    const t = useTranslations();
    return (
        <EntryListTemplate<PresetModel>
            modelType={modelType} modelApi={modelApi} entryType={entryType} contextType={PresetContext}
            createAccessor={() => ({
                content: "",
                priority: 100,
            })}
            updateAccessor={(data): PresetStyleModel => ({
                content: data.get("content") as string,
                priority: parseInt(data.get("priority") as string),
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
                            <FieldLabel htmlFor={`${entryType}-priority-${entry.id}`}>
                                {t("default.priority")}
                            </FieldLabel>
                            <Input name="priority" type={"number"}
                                   id={`${entryType}-priority-${entry.id}`}
                                   defaultValue={entry.priority}/>
                        </Field>
                    </div>
                    <Field>
                        <FieldLabel htmlFor={`${entryType}-content-${entry.id}`}>
                            {t("default.content")}
                        </FieldLabel>
                        <Textarea name="content"
                                  id={`${entryType}-content-${entry.id}`}
                                  defaultValue={entry.content}/>
                    </Field>
                </>
            )}></EntryListTemplate>
    );
}

export const tabConfig: TabConfig = {
    id: entryType,
    label: () => <EntryNavigationTemplate space={modelType} value={entryType} icon={PaletteIcon}/>,
    component: Content
}