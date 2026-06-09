import React, {useCallback, useMemo, useState} from "react";
import {FileCode2Icon} from "lucide-react";
import {useTranslations} from "next-intl";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";
import {Field, FieldLabel} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Checkbox} from "@/components/ui/checkbox";
import {Label} from "@/components/ui/label";
import {put} from "@/client";
import {TabConfig} from "@/components/custom/tab";
import {EditFormTemplate} from "@/components/template/edit-form-template";
import {EntryNavigationTemplate} from "@/components/template/navigation-template";
import {EntryListTemplate} from "@/components/template/entry-list-template";
import {PresetModel, moduleName, moduleArrayName} from "@/presets/models";
import {PresetContext, usePresetContext} from "@/presets/client/models";
import {lorebookMatchEditorRegistry, MatchEditorRegistry} from "./match-editor";
import {engineName} from "../models";

function EditorContent({entry, matchEditorRegistry}: { entry: any, matchEditorRegistry: MatchEditorRegistry, }) {
    const matchEditors = matchEditorRegistry.records;
    const [matchType, setMatchType] = useState<string>(entry.matchType);
    const [editor, setEditor] = useState(matchEditors[matchType]);
    const t = useTranslations();
    const {model} = usePresetContext(t);
    if (!model) {
        throw new Error("model is not available at this time");
    }
    const handleMatchTypeChange = useCallback((type: string) => {
        setMatchType(type);
        const newEditor = matchEditors[type];
        setEditor(newEditor);
    }, [matchEditors]);
    return (
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
                    <FieldLabel htmlFor={"lorebook-match_type"}>
                        {t("lorebook.match_type")}
                    </FieldLabel>
                    <Select name="matchType"
                            value={matchType}
                            onValueChange={handleMatchTypeChange}>
                        <SelectTrigger className="w-full"
                                       id={"lorebook-match_type"}>
                            <SelectValue/>
                        </SelectTrigger>
                        <SelectContent position="popper">
                            <SelectGroup>
                                {matchEditorRegistry.getSorted().map((e) =>
                                    <SelectItem key={e.id} value={e.id}>
                                        {t(`lorebook.match_type_${e.id}`)}
                                    </SelectItem>
                                )}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </Field>
            </div>
            {editor && (
                () => {
                    const EditorComponent = editor.component;
                    return <EditorComponent defaultValue={entry.matchExpression}/>;
                }
            )()}
            <div className="grid grid-cols-2 gap-4">
                <Field>
                    <FieldLabel htmlFor={`${engineName}-priorityLayer-${entry.id}`}>
                        {t("lorebook.priority_layer")}
                    </FieldLabel>
                    <Input name="priorityLayer" type={"number"}
                           id={`${engineName}-priorityLayer-${entry.id}`}
                           defaultValue={entry.priorityLayer}/>
                </Field>
                <Field>
                    <FieldLabel htmlFor={`${engineName}-priorityOrder-${entry.id}`}>
                        {t("lorebook.priority_order")}
                    </FieldLabel>
                    <Input name="priorityOrder" type={"number"}
                           id={`${engineName}-priorityOrder-${entry.id}`}
                           defaultValue={entry.priorityOrder}/>
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
    );
}

function Tab() {
    const matchEditorRegistry = useMemo(() => lorebookMatchEditorRegistry, []);
    const matchEditors = matchEditorRegistry.records;
    const t = useTranslations();
    return (
        <div className={"flex w-full h-full"}>
            <EditFormTemplate
                className={"w-48"} modelType={moduleName} contextType={PresetContext}
                updateHandler={async (model, data) =>
                    await put("/presets/{id}",
                        {
                            content: {
                                "lorebook": {
                                    includeName: Boolean(data.get("includeName"))
                                }
                            },
                        },
                        {
                            params: {"id": model.id,}
                        })}
                updateContent={(model) => (
                    <>
                        <Field orientation={"horizontal"}>
                            <Checkbox name="includeName" id={`${moduleName}-${engineName}-includeName`}
                                      defaultChecked={model.content.lorebook?.includeName ?? false}/>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Label htmlFor={`${moduleName}-${engineName}-includeName`}>
                                        {t(`${engineName}.include_name`)}
                                    </Label>
                                </TooltipTrigger>
                                <TooltipContent className={"max-w-xs"}>
                                    <p>{t(`${engineName}.include_name_description`)}</p>
                                </TooltipContent>
                            </Tooltip>
                        </Field>
                    </>
                )}>
            </EditFormTemplate>
            <EntryListTemplate<PresetModel>
                modelType={moduleName} modelApi={moduleArrayName} entryType={engineName} contextType={PresetContext}
                createAccessor={() => ({
                    matchType: "normal",
                    matchExpression: [],
                    content: "",
                    priorityLayer: 100,
                    priorityOrder: 100,
                })}
                updateAccessor={data => {
                    const matchType = data.get("matchType") as string;
                    return ({
                        matchType: matchType,
                        matchExpression: matchEditors[matchType].getValue(data),
                        content: data.get("content") as string,
                        priorityLayer: parseInt(data.get("priorityLayer") as string),
                        priorityOrder: parseInt(data.get("priorityOrder") as string),
                    });
                }}
                updateContent={entry => <EditorContent
                    entry={entry} matchEditorRegistry={matchEditorRegistry}/>}/>
        </div>

    );
}

export const tabConfig: TabConfig = {
    id: engineName,
    label: () => <EntryNavigationTemplate space={moduleName} value={engineName} icon={FileCode2Icon}/>,
    component: Tab
}