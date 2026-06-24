'use client';
import {EntryState} from "@/business/client/models";
import {createUsePagedItemsState} from "@/components/custom/pager";
import {get} from "@/client";
import {moduleName, modulePlural} from "@/presets/models";
import {PresetScriptModel} from "../models";
import {engineName} from "../models";

export const usePagedItemsState = createUsePagedItemsState<PresetScriptModel>(
    async options => {
        return await get('/presets/{id}/entries/{entryType}', {params: options})
    });

export const entryState: EntryState<PresetScriptModel> = {
    moduleName, modulePlural, usePagedItemsState, entryType: engineName
};