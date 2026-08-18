'use client';
import React, {useState} from "react";
import {FileIcon} from "lucide-react";
import {useTranslations} from "next-intl";
import {Field, FieldLabel} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {TabManager} from "@/components/custom/tab";
import {get, put} from "@/client";
import {ModelUpdate} from "@/business/client/template/model-update";
import {LlmapiModel, moduleName} from "../models";
import {llmapiProviderRegistry} from "./provider";
import {modelState} from './models';
import {EntryTabHeader} from "@/business/client/template/tab-header";
import {LlmapiProvider} from "@/modules/llmapis/client/provider-models";
import {Selector} from "@/components/custom/selector";
import {RequireModel} from "@/modules/presets/models";
import {useErrorHandler} from "@/handler/client/error";
import {RemoteSearchCombobox} from "@/components/custom/combobox";
import {PagedResult} from "@/business/models";
import {GridField} from "@/components/custom/GridField";

export function LlmapiRequireField(
    {
        defaultValue,
        value,
        onValueChange,
        prefix
    }: {
        value?: RequireModel | null,
        onValueChange?: (value: RequireModel | null) => void,
        defaultValue?: RequireModel | null,
        prefix?: string,
    }) {
    const t = useTranslations();
    const {handleError} = useErrorHandler();
    return (<Field>
        <FieldLabel htmlFor={`${prefix ?? moduleName}-llmapi`}>
            {t("default.llmapi")}
        </FieldLabel>

        <RemoteSearchCombobox
            name={`llmapi`} id={`${prefix ?? moduleName}-llmapi`}
            onValueChange={onValueChange}
            defaultValue={defaultValue}
            value={value}
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
    const [configEditor, setConfigEditor] = useState<LlmapiProvider | null>(
        llmapiProviderRegistry.records[model.provider ?? ""] ?? null);
    return <>
        <GridField>
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
            <Field>
                <FieldLabel htmlFor={`${moduleName}-max_iterations`}>
                    {t("llmapi.max_iterations")}
                </FieldLabel>
                <Input name="max_iterations"
                       id={`${moduleName}-max_iterations`}
                       type="number" min={2} max={100} step={1}
                       defaultValue={model.content.maxIterations ?? 0}
                />
            </Field>
        </GridField>
        <Field>
            <FieldLabel htmlFor={`${moduleName}-provider`}>
                {t(`${moduleName}.provider`)}
            </FieldLabel>
            <Selector id={`${moduleName}-provider`}
                      items={llmapiProviderRegistry.getSorted()}
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
                return await put("/llmapis/{id}",
                    {
                        content: {
                            config: llmapiProviderRegistry.records[provider]?.getValue(data),
                            maxIterations: parseInt(data.get("max_iterations") as string),
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