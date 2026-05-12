'use client';
import React, {useCallback, useMemo, useState} from "react";
import {useTranslations} from "next-intl";
import {FileIcon} from "lucide-react";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Field, FieldLabel} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {put} from "@/client";
import {TabConfig} from "@/client/components/tab";
import {EntryNavigationTemplate} from "@/client/business/template/navigation-template";
import {EditFormTemplate} from "@/client/business/template/edit-form-template";
import {LlmapiContext} from "@/client/business/llmapis/context";
import {llmapiConfigRegistry} from "@/client/business/llmapis/normal/index";
import {LlmapiConfigRegistry} from "@/client/business/llmapis/normal/config";
import {LlmapiModel, name as modelType} from "@/shared/business/llmapis";
import {entryType} from "./context";

const prefix = `${modelType}-${entryType}`;

function ConfigContent({model, llmapiConfigRegistry}: {
    model: LlmapiModel,
    llmapiConfigRegistry: LlmapiConfigRegistry
}) {
    const t = useTranslations();
    const llmapiConfigs = llmapiConfigRegistry.records;
    const [provider, setProvider] = useState<string>(model.content.provider);
    const [editor, setEditor] = useState(llmapiConfigs[provider]);


    const handleProviderChange = useCallback((type: string) => {
        setProvider(type);
        const newEditor = llmapiConfigs[type];
        setEditor(newEditor);
    }, [llmapiConfigs]);

    return <>
        <Field>
            <FieldLabel htmlFor={`${prefix}-provider`}>
                {t(`${modelType}.provider`)}
            </FieldLabel>
            <Select name="provider"
                    value={provider}
                    onValueChange={handleProviderChange}>
                <SelectTrigger className="w-full"
                               id={`${prefix}-provider`}>
                    <SelectValue/>
                </SelectTrigger>
                <SelectContent position="popper">
                    <SelectGroup>
                        {llmapiConfigRegistry.getSorted().map((e) =>
                            <SelectItem key={e.id} value={e.id}>
                                {t(`${modelType}.provider_${e.id}`)}
                            </SelectItem>
                        )}
                    </SelectGroup>
                </SelectContent>
            </Select>
        </Field>
        {editor && (
            () => {
                const EditorComponent = editor.component;
                return <EditorComponent llmapi={model} defaultValue={model.content["config"]}/>;
            }
        )()}
    </>
}

function Content() {
    const t = useTranslations();
    const matchEditorRegistry = useMemo(() => llmapiConfigRegistry, []);
    const matchEditors = matchEditorRegistry.records;
    return <EditFormTemplate
        modelType={modelType}
        contextType={LlmapiContext}
        updateHandler={async (model, data) => {
            const key = data.get("apikey") as string | undefined;
            const provider = data.get("provider") as string;
            await put("/llmapis/{id}",
                {
                    content: {
                        "provider": provider,
                        "config": matchEditors[provider]?.getValue(data)
                    },
                    name: data.get("name") as string,
                    version: data.get("version") as string,
                    key: model.key === key || !key || key === '' ? undefined : key,
                },
                {
                    params: {"id": model.id,}
                });
        }}
        updateContent={(model) => <>
            <div className="grid grid-cols-2 gap-4">
                <Field>
                    <Label htmlFor={`${prefix}-code`}>{t("default.code") + "*"}</Label>
                    <Input id={`${prefix}-code`} name="code"
                           defaultValue={model.code} disabled/>
                </Field>
                <Field>
                    <FieldLabel htmlFor={`${prefix}-name`}>
                        {t("default.name")}
                    </FieldLabel>
                    <Input name="name" id={`${prefix}-name`}
                           defaultValue={model.name}
                    />
                </Field>
                <Field>
                    <FieldLabel htmlFor={`${prefix}-version`}>
                        {t("default.version")}
                    </FieldLabel>
                    <Input name="version"
                           id={`${prefix}-version`}
                           defaultValue={model.version}
                    />
                </Field>
            </div>
            <ConfigContent model={model} llmapiConfigRegistry={matchEditorRegistry}/>
        </>}/>
}

export const tabConfig: TabConfig = {
    id: entryType,
    label: () => <EntryNavigationTemplate space="default" value="property" icon={FileIcon}/>,
    component: Content
}