import React, {useCallback, useState} from "react";
import {FileCode2Icon} from "lucide-react";
import {useTranslations} from "next-intl";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Field, FieldLabel} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {TabConfig} from "@/components/custom/tab";
import {EntryNavigationTemplate} from "@/components/template/navigation-template";
import {EntryListTemplate} from "@/components/template/entry-list-template";
import {PresetModel, moduleName, moduleArrayName} from "@/presets/models";
import {PresetContext, usePresetContext} from "@/presets/client/models";
import {lorebookMatcherRegistry} from "./match";
import {engineName, PresetLorebookModel} from "../models";
import {EntryModel} from "@/business/models";
import {matchName} from "@/engines/lorebooks/match/always/models";

const roles =["system", "user", "assistant"]

function EditorContent({entry}: {
    entry: PresetLorebookModel,
}) {
    const matchEditors = lorebookMatcherRegistry.records;
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
                    <FieldLabel htmlFor={`${engineName}-priority-${entry.id}`}>
                        {t("default.priority")}
                    </FieldLabel>
                    <Input name="priority" type={"number"}
                           min={0} max={9999}
                           id={`${engineName}-priority-${entry.id}`}
                           defaultValue={entry.priority}/>
                </Field>
                <Field>
                    <FieldLabel htmlFor={`${engineName}-layer-${entry.id}`}>
                        {t("default.layer")}
                    </FieldLabel>
                    <Input name="layer" type={"number"}
                           id={`${engineName}-layer-${entry.id}`}
                           defaultValue={entry.layer}/>
                </Field>
                <Field>
                    <FieldLabel htmlFor={"lorebook-match_type"}>
                        {t("lorebook.role")}
                    </FieldLabel>
                    <Select name="role" defaultValue={entry.role}>
                        <SelectTrigger className="w-full"
                                       id={"lorebook-role"}>
                            <SelectValue/>
                        </SelectTrigger>
                        <SelectContent position="popper">
                            <SelectGroup>
                                {roles.map((v) =>
                                    <SelectItem key={v} value={v}>
                                        {v}
                                    </SelectItem>
                                )}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
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
                                {lorebookMatcherRegistry.getSorted().map((e) =>
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
                    const EditorComponent = editor.editor;
                    return <EditorComponent defaultValue={entry.matchExpression}/>;
                }
            )()}
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
    const matchEditors = lorebookMatcherRegistry.records;
    return (
        <EntryListTemplate<PresetModel>
            modelType={moduleName} modelApi={moduleArrayName} entryType={engineName} contextType={PresetContext}
            createAccessor={(): Omit<PresetLorebookModel, keyof EntryModel> => ({
                matchType: matchName,
                matchExpression: [],
                content: "",
                priority: 100,
                layer: 100,
                role: 'system'
            })}
            updateAccessor={(data): Omit<PresetLorebookModel, keyof EntryModel> => {
                const matchType = data.get("matchType") as string;
                return ({
                    matchType: matchType,
                    matchExpression: matchEditors[matchType].getEditorValue(data),
                    content: data.get("content") as string,
                    priority: parseInt(data.get("priority") as string),
                    layer: parseInt(data.get("layer") as string),
                    role: data.get("role") as string,
                });
            }}
            updateContent={entry => <EditorContent
                entry={entry}/>}/>
    );
}

export const tabConfig: TabConfig = {
    id: engineName,
    label: () => <EntryNavigationTemplate space={moduleName} value={engineName} icon={FileCode2Icon}/>,
    component: Tab
}