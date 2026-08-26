import {Registerable} from "@/utils/register";
import {LlmapiToolModel, SlotModel} from "@/modules/stories/models";
import React from "react";
import {engineName, PresetToolConfigModel} from "@/engines/tools/models";
import {SlotCallingResult} from "@/modules/models/calling";
import {EntryState} from "@/business/client/models";
import {moduleName, modulePlural} from "@/modules/presets/models";
import {refreshItem} from "@/modules/presets/client/tabs";
import {createUsePagedItemsState} from "@/components/custom/pager";
import {get} from "@/client";

export interface LlmapiToolProps {
    defaultValue?: any,
    entry: PresetToolConfigModel,
    formRef: React.RefObject<HTMLFormElement | null>,
}

export interface LlmapiTool {
    disabled?: boolean,
    model: LlmapiToolModel,
    invoke: (args: any) => Promise<SlotCallingResult>,
}

export interface LlmapiToolProvider extends Registerable {
    component: React.ComponentType<LlmapiToolProps>,
    getValue: (data: FormData) => any,
    create: (config: PresetToolConfigModel, slot: SlotModel) => Promise<LlmapiTool[]>,
}

export const usePagedItemsState = createUsePagedItemsState<PresetToolConfigModel>(
    async options => {
        return await get('/presets/{id}/entries/{entryType}', {params: options})
    });


export const entryState: EntryState<PresetToolConfigModel> = {
    moduleName, modulePlural, usePagedItemsState, entryType: engineName, refreshItem
};