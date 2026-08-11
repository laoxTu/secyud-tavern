'use client';
import React, {useState} from "react";
import {FileIcon} from "lucide-react";
import {useTranslations} from "next-intl";
import {Field, FieldLabel} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {TabManager} from "@/components/custom/tab";
import {get, put} from "@/client";
import {llmapiInputBuilderManager} from "@/modules/llmapis/client/input-builder";
import {ModelUpdate} from "@/business/client/template/model-update";
import {LlmapiModel, moduleName} from "../models";
import {llmapiConfigRegistry} from "./config";
import {modelState} from './models';
import {EntryTabHeader} from "@/business/client/template/tab-header";
import {LlmapiConfig} from "@/modules/llmapis/client/config-models";
import {LlmapiInputBuilder} from "@/modules/llmapis/client/input-builder-models";
import {Selector} from "@/components/custom/selector";
import {RequireModel} from "@/modules/presets/models";
import {useErrorHandler} from "@/handler/client/error";
import {RemoteSearchCombobox} from "@/components/custom/combobox";
import {PagedResult} from "@/business/models";

export function LlmapiRequireField({defaultValue, prefix}: { defaultValue?: RequireModel | null, prefix?: string }) {
    const t = useTranslations();
    const {handleError} = useErrorHandler();
    return (<Field>
        <FieldLabel htmlFor={`${prefix ?? moduleName}-llmapi`}>
            {t("default.llmapi")}
        </FieldLabel>

        <RemoteSearchCombobox
            name={`llmapi`} id={`${prefix ?? moduleName}-llmapi`}
            defaultValue={defaultValue ?? null}
            comparer={(u, v) => u.code === v.code}
            labelAccessor={e => `${e.name}-${e.version}(${e.author})`}
            valueAccessor={e => JSON.stringify(e)}
            searchHandler={async (search: string | null) => {
                try {
                    const res = await get("/llmapis", {
                        params: {
                            search: {
                                fuzzy: search,
                            },
                        }
                    }) as PagedResult<LlmapiModel>;
                    return res.data.map(u => ({
                        code: u.code,
                        name: u.name,
                        author: u.provider,
                        version: u.version,
                    }));
                } catch (e) {
                    handleError(e);
                }
            }}/>
    </Field>);
}

function UpdateContent({model}: { model: LlmapiModel }) {
    const t = useTranslations();
    const [configEditor, setConfigEditor] = useState<LlmapiConfig | null>(
        llmapiConfigRegistry.records[model.provider ?? ""] ?? null);
    const [builderEditor, setBuilderEditor] = useState<LlmapiInputBuilder | null>(
        llmapiInputBuilderManager.records[model.builder ?? ""] ?? null);
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
        <Field>
            <FieldLabel htmlFor={`${moduleName}-provider`}>
                {t(`${moduleName}.provider`)}
            </FieldLabel>
            <Selector id={`${moduleName}-provider`}
                      items={llmapiConfigRegistry.getSorted()}
                      name={'provider'}
                      value={configEditor}
                      onValueChange={setConfigEditor}
                      valueAccessor={u => u.id}
                      labelAccessor={(u) => t(`${moduleName}.provider_${u.id}`)}/>
        </Field>
        {configEditor?.component && (() => {
            const Component = configEditor.component;
            return <Component/>
        })()}
        <Field>
            <FieldLabel htmlFor={`${moduleName}-builder`}>
                {t(`${moduleName}.builder`)}
            </FieldLabel>
            <Selector id={`${moduleName}-builder`}
                      items={llmapiInputBuilderManager.getSorted()}
                      name={'builder'}
                      value={builderEditor}
                      onValueChange={setBuilderEditor}
                      valueAccessor={u => u.id}
                      labelAccessor={(u) => t(`${moduleName}.builder_${u.id}`)}/>
        </Field>
        {builderEditor?.component && (() => {
            const Component = builderEditor.component;
            return <Component/>
        })()}
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