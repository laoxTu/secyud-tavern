'use client';
import React, {useState} from "react";
import {FileIcon} from "lucide-react";
import {useTranslations} from "next-intl";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Field, FieldLabel} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {TabManager} from "@/components/custom/tab";
import {put} from "@/client";
import {llmapiInputBuilderManager} from "@/modules/llmapis/client/input-builder";
import {ModelUpdate} from "@/business/client/template/model-update";
import {LlmapiModel, moduleName} from "../models";
import {llmapiConfigRegistry} from "./config";
import {modelState, useItemState} from './models';
import {EntryTabHeader} from "@/business/client/template/tab-header";


function ConfigContent() {
    const t = useTranslations();
    const {model} = useItemState();
    const records = llmapiConfigRegistry.records;
    const defaultProvider = model?.provider ?? Object.values(records)[0].id;
    const [editor, setEditor] = useState(records[defaultProvider]);
    const EditorComponent = editor.component;

    const handleChange = (type: string) => {
        setEditor(records[type]);
    };

    return (<>
        <Field>
            <FieldLabel htmlFor={`${moduleName}-provider`}>
                {t(`${moduleName}.provider`)}
            </FieldLabel>
            <Select name="provider"
                    defaultValue={defaultProvider}
                    onValueChange={handleChange}>
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
        <EditorComponent/>
    </>)
}

function BuilderContent() {
    const t = useTranslations();
    const records = llmapiInputBuilderManager.records;
    const {model} = useItemState();
    const defaultBuilder = model?.builder ?? Object.values(records)[0].id;
    const [editor, setEditor] = useState(records[defaultBuilder]);
    const EditorComponent = editor.component;

    const handleChange = (type: string) => {
        setEditor(records[type]);
    };

    return <>
        <Field>
            <FieldLabel htmlFor={`${moduleName}-builder`}>
                {t(`${moduleName}.builder`)}
            </FieldLabel>
            <Select name="builder"
                    defaultValue={defaultBuilder}
                    onValueChange={handleChange}>
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
        <EditorComponent/>
    </>
}

function DefaultTab() {
    const t = useTranslations();
    const configEditors = llmapiConfigRegistry.records;
    const builderEditors = llmapiInputBuilderManager.records;
    return <ModelUpdate<LlmapiModel>
        modelState={modelState}
        props={{
            updateHandler: async (model, data) => {
                const key = data.get("apikey") as string | undefined;
                const provider = data.get("provider") as string;
                const builder = data.get("builder") as string;
                return await put("/llmapis/{id}",
                    {
                        content: {
                            "config": configEditors[provider]?.getValue(data),
                            "builder": builderEditors[builder]?.getValue(data),
                        },
                        provider: provider,
                        builder: builder,
                        name: data.get("name") as string,
                        code: model.code,
                        version: data.get("version") as string,
                        key: model.key === key || !key || key === '' ? undefined : key,
                    } as Partial<LlmapiModel>,
                    {
                        params: {"id": model.id,}
                    });
            },
            updateContent: (model) => (<>
                <div className="grid md:grid-cols-2 gap-4">
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
                <ConfigContent/>
                <BuilderContent/>
            </>)
        }}/>
}

export const llmapiTabManager = new TabManager(moduleName, {
    id: 'default',
    label: () => <EntryTabHeader space="default" value="property" icon={FileIcon}/>,
    component: DefaultTab
});