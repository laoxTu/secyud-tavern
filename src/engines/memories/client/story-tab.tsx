import React from "react";
import {BrainIcon} from "lucide-react";
import {useTranslations} from "next-intl";
import {Field, FieldLabel} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {TabConfig} from "@/components/custom/tab";
import {moduleName} from "@/modules/stories/models";
import {engineName, StoryMemoryModel} from "../models";
import {EntryTabHeader} from "@/business/client/template/tab-header";
import {EntryList} from "@/business/client/template/entry-list";
import {entryState} from "./models";
import {del, post, put} from "@/client";
import {submitTargetFormOnKey} from "@/business/client";
import {rowHalf, spanHalf} from "@/components/custom/grid-field";
import {useItemState} from "@/modules/stories/client/models";
import {EntryOperation} from "@/business/models";
import {cn} from "@/lib/utils";
import {Selector} from "@/components/custom/selector";
import {memoryTypes} from "@/engines/memories/client/tool";
import {TagBox} from "@/components/custom/combobox";
import {storyTabIsHide} from "@/modules/stories/client/tabs";

function Tab() {
    const t = useTranslations();
    const {model} = useItemState();
    return (
        <EntryList<StoryMemoryModel>
            entryState={entryState}
            modelId={model!.id}
            createProps={{
                createHandler: async (data) => {
                    await post<EntryOperation<StoryMemoryModel>>('/stories/{id}/entries/{entryType}', {
                        code: data.get('code') as string,
                        name: data.get('name') as string,
                        text: "",
                        sequence: 100,
                        importance: 5,
                        type: "event",
                        tags: [],
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
                    await put('/stories/{id}/entries/{entryType}/{entryId}/disabled', {
                        disabled,
                    }, {
                        params: {
                            id: model?.id,
                            entryType: engineName,
                            entryId: entry.entryId,
                        }
                    })
                },
                deleteHandler: async entry => {
                    await del('/stories/{id}/entries/{entryType}/{entryId}', {
                        params: {
                            id: model?.id,
                            entryType: engineName,
                            entryId: entry.entryId
                        }
                    })
                },
                cloneHandler: async (entry, data) => {
                    await post<EntryOperation<StoryMemoryModel>>('/stories/{id}/entries/{entryType}', {
                        ...entry,
                        code: data.get('code') as string,
                        name: data.get('name') as string,
                    }, {
                        params: {
                            id: model?.id,
                            entryType: engineName,
                        }
                    })
                },
                updateHandler: async (entry, data) => {
                    await put<EntryOperation<StoryMemoryModel>>(
                        '/stories/{id}/entries/{entryType}/{entryId}',
                        {
                            code: data.get('code') as string,
                            name: data.get('name') as string,
                            text: data.get('text') as string,
                            sequence: parseInt(data.get('sequence') as string),
                            importance: parseInt(data.get('importance') as string),
                            type: data.get('type') as string,
                            tags: data.getAll('tag') as string[],
                        },
                        {
                            params: {
                                id: model?.id,
                                entryType: engineName,
                                entryId: entry.entryId
                            }
                        });
                },
                updateContent: (entry) => (<>
                    <Field className={cn(spanHalf, rowHalf)}>
                        <FieldLabel htmlFor={`${engineName}-text-${entry.entryId}`}>
                            {t("memory.text")}
                        </FieldLabel>
                        <Textarea name="text"
                                  id={`${engineName}-text-${entry.entryId}`}
                                  defaultValue={entry.text}
                                  onKeyDown={submitTargetFormOnKey}/>
                    </Field>
                    <Field>
                        <FieldLabel htmlFor={`${engineName}-code-${entry.entryId}`}>
                            {t("default.code")}
                        </FieldLabel>
                        <Input name="code"
                               id={`${engineName}-code-${entry.entryId}`}
                               defaultValue={entry.code ?? ""}/>
                    </Field>
                    <Field>
                        <FieldLabel htmlFor={`${engineName}-name-${entry.entryId}`}>
                            {t("default.name")}
                        </FieldLabel>
                        <Input name="name"
                               id={`${engineName}-name-${entry.entryId}`}
                               defaultValue={entry.name ?? ""}/>
                    </Field>
                    <Field>
                        <FieldLabel htmlFor={`${engineName}-sequence-${entry.entryId}`}>
                            {t("memory.sequence")}
                        </FieldLabel>
                        <Input name="sequence" type={"number"} min={0} step={1}
                               id={`${engineName}-sequence-${entry.entryId}`}
                               defaultValue={entry.sequence}/>
                    </Field>
                    <Field>
                        <FieldLabel htmlFor={`${engineName}-importance-${entry.entryId}`}>
                            {t("memory.importance")}
                        </FieldLabel>
                        <Input name="importance" type={"number"}
                               min={1} step={1} max={10}
                               id={`${engineName}-importance-${entry.entryId}`}
                               defaultValue={entry.importance}/>
                    </Field>
                    <Field>
                        <FieldLabel htmlFor={`${engineName}-type-${entry.entryId}`}>
                            {t("default.type")}
                        </FieldLabel>
                        <Selector id={`${engineName}-type-${entry.entryId}`}
                                  items={memoryTypes} name={"type"}
                                  defaultValue={entry.type}/>
                    </Field>
                    <Field>
                        <FieldLabel htmlFor={`${engineName}-tag-${entry.entryId}`}>
                            {t("default.tags")}
                        </FieldLabel>
                        <TagBox id={`${engineName}-tag-${entry.entryId}`}
                                name={"tag"} defaultValue={entry.tags}/>
                    </Field>
                </>)
            }}/>
    );
}

export const tabConfig: TabConfig = {
    id: engineName,
    hide: () => storyTabIsHide(engineName),
    label: () => <EntryTabHeader space={moduleName} value={engineName} icon={BrainIcon}/>,
    component: Tab
}