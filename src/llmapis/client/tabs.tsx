'use client';
import React, {useCallback, useState} from "react";
import {FileIcon} from "lucide-react";
import {useTranslations} from "next-intl";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Field, FieldLabel} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {TabManager} from "@/components/custom/tab";
import {EntryNavigationTemplate} from "@/components/template/navigation-template";
import {EditFormTemplate} from "@/components/template/edit-form-template";
import {put} from "@/client";
import {LlmapiContext} from "./models";
import {LlmapiModel, moduleName} from "../models";
import {llmapiConfigRegistry} from "./config";
import {llmapiInputBuilderManager} from "@/llmapis/client/input-builder";


function ConfigContent({model, }: {
    model: LlmapiModel,
}) {
    const t = useTranslations();
    const llmapiConfigs = llmapiConfigRegistry.records;
    const first = Object.values(llmapiConfigs)[0];
    const [provider, setProvider] = useState<string | undefined>(model.provider ?? first.id);
    const [editor, setEditor] = useState(model.provider ? llmapiConfigs[model.provider] : first);

    const handleProviderChange = useCallback((type: string) => {
        setProvider(type);
        const newEditor = llmapiConfigs[type];
        setEditor(newEditor);
    }, [llmapiConfigs]);

    return <>
        <Field>
            <FieldLabel htmlFor={`${moduleName}-provider`}>
                {t(`${moduleName}.provider`)}
            </FieldLabel>
            <Select name="provider"
                    value={provider}
                    onValueChange={handleProviderChange}>
                <SelectTrigger className="w-full"
                               id={`${moduleName}-provider`}>
                    <SelectValue/>
                </SelectTrigger>
                <SelectContent position="popper">
                    <SelectGroup>
                        {llmapiConfigRegistry.getSorted().map((e) =>
                            <SelectItem key={e.id} value={e.id}>
                                {t(`${moduleName}.provider_${e.id}`)}
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

function BuilderContent({model,}: {
    model: LlmapiModel,
}) {
    const t = useTranslations();
    const llmapiBuilders = llmapiInputBuilderManager.records;
    const first = Object.values(llmapiBuilders)[0];
    const [builder, setBuilder] = useState<string | undefined>(model.builder ?? first.id);
    const [editor, setEditor] = useState(model.builder ? llmapiBuilders[model.builder] : first);


    const handleBuilderChange = useCallback((type: string) => {
        setBuilder(type);
        const newEditor = llmapiBuilders[type];
        setEditor(newEditor);
    }, [llmapiBuilders]);

    return <>
        <Field>
            <FieldLabel htmlFor={`${moduleName}-builder`}>
                {t(`${moduleName}.builder`)}
            </FieldLabel>
            <Select name="builder"
                    value={builder}
                    onValueChange={handleBuilderChange}>
                <SelectTrigger className="w-full"
                               id={`${moduleName}-builder`}>
                    <SelectValue/>
                </SelectTrigger>
                <SelectContent position="popper">
                    <SelectGroup>
                        {llmapiInputBuilderManager.getSorted().map((e) =>
                            <SelectItem key={e.id} value={e.id}>
                                {t(`${moduleName}.builder_${e.id}`)}
                            </SelectItem>
                        )}
                    </SelectGroup>
                </SelectContent>
            </Select>
        </Field>
        {editor && (
            () => {
                const EditorComponent = editor.component;
                return <EditorComponent llmapi={model} defaultValue={model.content["builder"]}/>;
            }
        )()}
    </>
}

function DefaultTab() {
    const t = useTranslations();
    const configEditors = llmapiConfigRegistry.records;
    const builderEditors = llmapiInputBuilderManager.records;
    return <EditFormTemplate
        modelType={moduleName}
        contextType={LlmapiContext}
        updateHandler={async (model, data) => {
            const key = data.get("apikey") as string | undefined;
            const provider = data.get("provider") as string;
            const builder = data.get("builder") as string;
            await put("/llmapis/{id}",
                {
                    content: {
                        "config": configEditors[provider]?.getValue(data),
                        "builder": builderEditors[builder]?.getValue(data),
                    },
                    provider: provider,
                    builder: builder,
                    name: data.get("name") as string,
                    version: data.get("version") as string,
                    key: model.key === key || !key || key === '' ? undefined : key,
                } as Partial<LlmapiModel>,
                {
                    params: {"id": model.id,}
                });
        }}
        updateContent={(model) => <>
            <div className="grid grid-cols-2 gap-4">
                <Field>
                    <Label htmlFor={`${moduleName}-code`}>{t("default.code") + "*"}</Label>
                    <Input id={`${moduleName}-code`} name="code"
                           defaultValue={model.code} disabled/>
                </Field>
                <Field>
                    <FieldLabel htmlFor={`${moduleName}-name`}>
                        {t("default.name")}
                    </FieldLabel>
                    <Input name="name" id={`${moduleName}-name`}
                           defaultValue={model.name}
                    />
                </Field>
                <Field>
                    <FieldLabel htmlFor={`${moduleName}-version`}>
                        {t("default.version")}
                    </FieldLabel>
                    <Input name="version"
                           id={`${moduleName}-version`}
                           defaultValue={model.version}
                    />
                </Field>
            </div>
            <ConfigContent model={model}/>
            <BuilderContent model={model}/>
        </>}/>
}

export const llmapiTabManager = new TabManager(moduleName, {
    id: 'default',
    label: () => <EntryNavigationTemplate space="default" value="property" icon={FileIcon}/>,
    component: DefaultTab
});