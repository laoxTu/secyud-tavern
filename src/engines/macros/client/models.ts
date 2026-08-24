'use client';
import {EntryState} from "@/business/client/models";
import {createUsePagedItemsState} from "@/components/custom/pager";
import {get} from "@/client";
import {moduleName, modulePlural} from "@/modules/presets/models";
import {engineName, PresetMacroModel} from "../models";
import {refreshItem} from "@/modules/presets/client/tabs";

export const usePagedItemsState = createUsePagedItemsState<PresetMacroModel>(
    async options => {
        return await get('/presets/{id}/entries/{entryType}', {params: options})
    });

export const entryState: EntryState<PresetMacroModel> = {
    moduleName, modulePlural, usePagedItemsState, entryType: engineName, refreshItem
};