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
import {TabConfig} from "@/components/custom/tab";
import {TemplateEntryList} from "@/business/client/template";
import {del, post, put} from "@/client";
import {EntryTabHeader} from "@/business/client/template/tab-header";
import {ComfyUIParameterModel, moduleName, parameterEntryName as engineName} from "@/modules/comfyui/models";
import {comfyUIParameterRegistry} from "@/modules/comfyui/client/parameter";
import {ComfyUIParameter, ComfyUIParameterProps} from "@/modules/comfyui/client/parameter-model";
import {parameterEntryState, useItemState} from "@/modules/comfyui/client/models";

function EditorContent({entry, formRef}: ComfyUIParameterProps) {
    const t = useTranslations();
    const editors = comfyUIParameterRegistry.records;
    const [editor, setEditor] = useState<ComfyUIParameter | null>(editors[entry.type] ?? null);

    return (
        <>
            <div className="grid md:grid-cols-2 gap-4">
                <Field>
                    <FieldLabel htmlFor={`${engineName}-priority-${entry.id}`}>
                        {t("default.priority")}
                    </FieldLabel>
                    <Input name="priority" type={"number"}
                           id={`${engineName}-priority-${entry.id}`}
                           defaultValue={entry.priority}/>
                </Field>
                <Field>
                    <FieldLabel htmlFor={`${engineName}-type-${entry.id}`}>
                        {t("comfyui.parameter_type")}
                    </FieldLabel>
                    <Select name="type"
                            defaultValue={entry.type}
                            itemToStringLabel={u => t(`comfyui.parameter_type_${u}`)}
                            onValueChange={t => t && setEditor(editors[t])}>
                        <SelectTrigger className="w-full"
                                       id={`${engineName}-type-${entry.id}`}>
                            <SelectValue/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                {comfyUIParameterRegistry.getSorted().map((e) =>
                                    <SelectItem key={e.id} value={e.id}>
                                        {t(`comfyui.parameter_type_${e.id}`)}
                                    </SelectItem>
                                )}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </Field>
            </div>
            {editor && (
                () => {
                    const EditorComponent = editor.editorComponent;
                    return <EditorComponent formRef={formRef} entry={entry}/>;
                }
            )()}
        </>
    );
}

function Tab() {
    const editors = comfyUIParameterRegistry.records;
    const {model} = useItemState();
    return (
        <TemplateEntryList<ComfyUIParameterModel>
            entryState={parameterEntryState}
            modelId={model!.id}
            createProps={{
                createHandler: async (data) => {
                    await post('/comfyuis/workflows/{id}/entries/{entryType}', {
                        code: data.get('code'),
                        name: data.get('name'),
                        priority: 100,
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
                    await put('/comfyuis/workflows/{id}/entries/{entryType}/{entryId}/disabled', {
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
                    await del('/comfyuis/workflows/{id}/entries/{entryType}/{entryId}', {
                        params: {
                            id: model?.id,
                            entryType: engineName,
                            entryId: entry.id
                        }
                    })
                },
                cloneHandler: async (entry, data) => {
                    await post('/comfyuis/workflows/{id}/entries/{entryType}', {
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
                    const type = data.get("type") as string;
                    const result: ComfyUIParameterModel = {
                        ...entry,
                        type: type,
                        config: editors[type].getEditorValue(data, entry),
                        priority: parseInt(data.get("priority") as string),
                        code: data.get('code') as string,
                        name: data.get('name') as string,
                    };
                    await put('/comfyuis/workflows/{id}/entries/{entryType}/{entryId}', result, {
                        params: {
                            id: model?.id,
                            entryType: engineName,
                            entryId: entry.id
                        }
                    });
                    return result;
                },
                updateContent: (entry, formRef) =>
                    (<EditorContent entry={entry} formRef={formRef}/>)
            }}/>
    );
}

export const tabConfig: TabConfig = {
    id: engineName,
    label: () => <EntryTabHeader space={moduleName} value={engineName} icon={FileCode2Icon}/>,
    component: Tab
}