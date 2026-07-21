'use client';
import React from "react";
import {FileIcon} from "lucide-react";
import {useTranslations} from "next-intl";
import {Field, FieldLabel} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {TabManager} from "@/components/custom/tab";
import {put} from "@/client";
import {llmapiInputBuilderManager} from "@/modules/llmapis/client/input-builder";
import {ModelUpdate} from "@/business/client/template/model-update";
import {LlmapiModel, moduleName} from "../models";
import {llmapiConfigRegistry} from "./config";
import {modelState} from './models';
import {EntryTabHeader} from "@/business/client/template/tab-header";
import {EditorSelectorField} from "@/components/custom/editor-selector";


function UpdateContent({model}: { model: LlmapiModel }) {
    const t = useTranslations();
    return <>
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
        <EditorSelectorField registry={llmapiConfigRegistry}
                             fieldLabel={t(`${moduleName}.provider`)}
                             id={`${moduleName}-provider`}
                             name={'provider'}
                             defaultValue={model.provider}
                             valueAccessor={u => u.id}
                             nameAccessor={(u) => t(`${moduleName}.provider_${u.id}`)}/>

        <EditorSelectorField registry={llmapiInputBuilderManager}
                             fieldLabel={t(`${moduleName}.builder`)}
                             id={`${moduleName}-builder`}
                             name={'builder'}
                             defaultValue={model.builder}
                             valueAccessor={u => u.id}
                             nameAccessor={(u) => t(`${moduleName}.builder_${u.id}`)}/>
    </>;
}

function DefaultTab() {
    return <ModelUpdate<LlmapiModel>
        modelState={modelState}
        props={{
            updateHandler: async (model, data) => {
                const key = data.get("apikey") as string | undefined;
                const provider = data.get("provider") as string;
                const builder = data.get("builder") as string;
                console.debug("builder", builder);
                console.debug("provider", provider);
                return await put("/llmapis/{id}",
                    {
                        content: {
                            "config": llmapiConfigRegistry.records[provider]?.getValue(data),
                            "builder": llmapiInputBuilderManager.records[builder]?.getValue(data),
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
            updateContent: (model) => (<UpdateContent model={model}/>),
        }}/>
}

export const llmapiTabManager = new TabManager(moduleName, {
    id: 'default',
    label: () => <EntryTabHeader space="default" value="property" icon={FileIcon}/>,
    component: DefaultTab
});