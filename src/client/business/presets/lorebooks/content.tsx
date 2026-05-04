import React, {useCallback, useMemo, useState} from "react";
import {FileCode2Icon} from "lucide-react";
import {useTranslations} from "next-intl";
import {Field, FieldLabel} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {put} from "@/client";
import {EditFormTemplate} from "@/client/business/template/edit-form-template";
import {EntryNavigationTemplate} from "@/client/business/template/navigation-template";
import {EntryListTemplate} from "@/client/business/template/entry-list-template";
import {TabConfig} from "@/client/components/tab";
import {PresetModel} from "@/shared/business/presets";
import {modelApi, modelType, PresetContext} from "../context";
import {entryType} from "./context";
import {Checkbox} from "@/components/ui/checkbox";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";
import {Label} from "@/components/ui/label";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {lorebookMatchEditorRegistry} from "@/client/business/presets/lorebooks/index";
import {usePresetContext} from "../context";
import {MatchEditorRegistry} from "@/client/business/presets/lorebooks/match";

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
                    <FieldLabel htmlFor={`${entryType}-name-${entry.id}`}>
                        {t("default.name")}
                    </FieldLabel>
                    <Input name="name"
                           id={`${entryType}-name-${entry.id}`}
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
                    <FieldLabel htmlFor={`${entryType}-priorityLayer-${entry.id}`}>
                        {t("lorebook.priority_layer")}
                    </FieldLabel>
                    <Input name="priorityLayer" type={"number"}
                           id={`${entryType}-priorityLayer-${entry.id}`}
                           defaultValue={entry.priorityLayer}/>
                </Field>
                <Field>
                    <FieldLabel htmlFor={`${entryType}-priorityOrder-${entry.id}`}>
                        {t("lorebook.priority_order")}
                    </FieldLabel>
                    <Input name="priorityOrder" type={"number"}
                           id={`${entryType}-priorityOrder-${entry.id}`}
                           defaultValue={entry.priorityOrder}/>
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
    );
}

function Content() {
    const matchEditorRegistry = useMemo(() => lorebookMatchEditorRegistry, []);
    const matchEditors = matchEditorRegistry.records;
    const t = useTranslations();
    return (
        <div className={"flex w-full h-full"}>
            <EditFormTemplate
                className={"w-48"} modelType={modelType} contextType={PresetContext}
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
                            <Checkbox name="includeName" id={`${modelType}-${entryType}-includeName`}
                                      defaultChecked={model.content.lorebook?.includeName ?? false}/>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Label htmlFor={`${modelType}-${entryType}-includeName`}>
                                        {t(`${entryType}.include_name`)}
                                    </Label>
                                </TooltipTrigger>
                                <TooltipContent className={"max-w-xs"}>
                                    <p>{t(`${entryType}.include_name_description`)}</p>
                                </TooltipContent>
                            </Tooltip>
                        </Field>
                    </>
                )}>
            </EditFormTemplate>
            <EntryListTemplate<PresetModel>
                modelType={modelType} modelApi={modelApi} entryType={entryType} contextType={PresetContext}
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
    id: entryType,
    label: () => <EntryNavigationTemplate space={modelType} value={entryType} icon={FileCode2Icon}/>,
    component: Content
}