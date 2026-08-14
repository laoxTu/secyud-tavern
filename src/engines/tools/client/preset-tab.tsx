import {ToolboxIcon} from "lucide-react";
import React from "react";
import {del, get, post, put} from "@/client";
import {TabConfig} from "@/components/custom/tab";
import {TemplateEntryList} from "@/business/client/template";
import {EntryTabHeader} from "@/business/client/template/tab-header";
import {useItemState} from "@/modules/presets/client/models";
import {moduleName} from "@/modules/presets/models";
import {engineName, LlmapiToolConfigModel} from "../models";
import {llmapiToolManager} from "@/engines/tools/client/manager";
import {EditorContent} from "./llmapi-tab";
import {createUsePagedItemsState} from "@/components/custom/pager";
import {EntryState} from "@/business/client/models";
import {modulePlural} from "@/modules/presets/models";

export const usePagedItemsState = createUsePagedItemsState<LlmapiToolConfigModel>(
    async options => {
        return await get('/presets/{id}/entries/{entryType}', {params: options})
    });

export const entryState: EntryState<LlmapiToolConfigModel> = {
    moduleName, modulePlural, usePagedItemsState, entryType: engineName
};

function Tab() {
    const {model} = useItemState();
    return (
        <TemplateEntryList<LlmapiToolConfigModel>
            entryState={entryState}
            modelId={model!.id}
            createProps={{
                createHandler: async (data) => {
                    await post('/presets/{id}/entries/{entryType}', {
                        code: data.get('code'),
                        name: data.get('name'),
                        provider: "",
                        value: {},
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
                    const provider = data.get('provider') as string;

                    const result: LlmapiToolConfigModel = {
                        ...entry,
                        code: data.get('code') as string,
                        name: data.get('name') as string,
                        provider: provider,
                        value: llmapiToolManager.records[provider]?.getValue(data),
                    };
                    await put('/presets/{id}/entries/{entryType}/{entryId}', result, {
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
    label: () => <EntryTabHeader space={moduleName} value={engineName} icon={ToolboxIcon}/>,
    component: Tab
}