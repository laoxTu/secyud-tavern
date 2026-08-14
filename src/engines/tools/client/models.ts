import {Registerable} from "@/utils/register";
import {LlmapiToolModel, SlotModel} from "@/modules/slots/models";
import React from "react";
import {EntryState} from "@/business/client/models";
import {moduleName, modulePlural} from "@/modules/llmapis/models";
import {engineName, LlmapiToolConfigModel} from "@/engines/tools/models";
import {createUsePagedItemsState} from "@/components/custom/pager";
import {get} from "@/client";

export interface LlmapiToolProps {
    defaultValue?: any,
    entry: LlmapiToolConfigModel,
}

export interface LlmapiToolContext {
    slot: SlotModel,
    config: LlmapiToolConfigModel,
}

export interface LlmapiTool {
    model: LlmapiToolModel,
    invoke: (args: any) => Promise<string>,
}

export interface LlmapiToolProvider extends Registerable {
    component: React.ComponentType<LlmapiToolProps>,
    getValue: (data: FormData) => any,
    create: (config: LlmapiToolConfigModel, slot: SlotModel) => Promise<LlmapiTool[]>,
}


export const usePagedItemsState = createUsePagedItemsState<LlmapiToolConfigModel>(
    async options => {
        return await get('/llmapis/{id}/entries/{entryType}', {params: options})
    });


export const entryState: EntryState<LlmapiToolConfigModel> = {
    moduleName, modulePlural, usePagedItemsState, entryType: engineName
};