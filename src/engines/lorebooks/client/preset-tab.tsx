import React, {useState} from "react";
import {FileCode2Icon} from "lucide-react";
import {useTranslations} from "next-intl";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import {Field, FieldLabel} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {TabConfig} from "@/components/custom/tab";
import {moduleName} from "@/presets/models";
import {matchName} from "../match/always/models";
import {TemplateEntryList} from "@/business/client/template";
import {del, post, put} from "@/client";
import {useItemState} from "@/presets/client/models";
import {EntryTabHeader} from "@/business/client/template/tab-header";
import {lorebookMatcherRegistry} from "./match";
import {engineName, PresetLorebookModel} from "../models";
import {entryState} from "@/engines/lorebooks/client/models";
import {submitTargetFormOnKey} from "@/business/client/index.js";

const roles = ["system", "user", "assistant"]

function EditorContent({entry}: {
    entry: PresetLorebookModel,
}) {
    const matchEditors = lorebookMatcherRegistry.records;
    const [editor, setEditor] = useState(matchEditors[entry.matchType]);
    const t = useTranslations();
    const handleChange = (type: string) => {
        setEditor(matchEditors[type]);
    };
    return (
        <>
            <div className="grid md:grid-cols-2 gap-4">
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
                    <FieldLabel htmlFor={`lorebook-role-${entry.id}`}>
                        {t("lorebook.role")}
                    </FieldLabel>
                    <Select name="role" defaultValue={entry.role}>
                        <SelectTrigger className="w-full"
                                       id={`lorebook-role-${entry.id}`}>
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
                    <FieldLabel htmlFor={`lorebook-match_type-${entry.id}`}>
                        {t("lorebook.match_type")}
                    </FieldLabel>
                    <Select name="matchType"
                            defaultValue={entry.matchType}
                            onValueChange={handleChange}>
                        <SelectTrigger className="w-full"
                                       id={`lorebook-match_type-${entry.id}`}>
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
                    return <EditorComponent defaultValue={entry.matchExpression} entry={entry}/>;
                }
            )()}
            <Field>
                <FieldLabel htmlFor={`${engineName}-content-${entry.id}`}>
                    {t("default.content")}
                </FieldLabel>
                <Textarea name="content"
                          id={`${engineName}-content-${entry.id}`}
                          defaultValue={entry.content}
                          onKeyDown={submitTargetFormOnKey}/>
            </Field>
        </>
    );
}

function Tab() {
    const matchEditors = lorebookMatcherRegistry.records;
    const {model} = useItemState();
    return (
        <TemplateEntryList<PresetLorebookModel>
            entryState={entryState}
            modelId={model!.id}
            createProps={{
                createHandler: async (data) => {
                    await post('/presets/{id}/entries/{entryType}', {
                        code: data.get('code'),
                        name: data.get('name'),
                        matchType: matchName,
                        matchExpression: [],
                        content: "",
                        priority: 100,
                        layer: 100,
                        role: 'user'
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
                            entryId: entry.id
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
                    const matchType = data.get("matchType") as string;
                    const result = {
                        ...entry,
                        matchType: matchType,
                        matchExpression: matchEditors[matchType].getEditorValue(data),
                        content: data.get("content") as string,
                        priority: parseInt(data.get("priority") as string),
                        layer: parseInt(data.get("layer") as string),
                        role: data.get("role") as string,
                        code: data.get('code') as string,
                        name: data.get('name') as string,
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
                updateContent: (entry) => (<EditorContent entry={entry}/>)
            }}/>
    );
}

export const tabConfig: TabConfig = {
    id: engineName,
    label: () => <EntryTabHeader space={moduleName} value={engineName} icon={FileCode2Icon}/>,
    component: Tab
}