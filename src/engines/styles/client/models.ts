'use client';
import {EntryState} from "@/business/client/models";
import {createUsePagedItemsState} from "@/components/custom/pager";
import {get} from "@/client";
import {PresetStyleModel} from "@/engines/styles/models";
import {moduleName, modulePlural} from "@/presets/models";
import {engineName} from "../models";

export const usePagedItemsState = createUsePagedItemsState<PresetStyleModel>(
    async options => {
        return await get('/presets/{id}/entries/{entryType}', {params: options})
    });

export const entryState: EntryState<PresetStyleModel> = {
    moduleName, modulePlural, usePagedItemsState, entryType: engineName
};