'use client';
import {EntryState} from "@/business/client/models";
import {createUsePagedItemsState} from "@/components/custom/pager";
import {get} from "@/client";
import {moduleName, modulePlural} from "@/modules/presets/models";
import {PresetRegexModel} from "../models";
import {engineName} from "../models";

export const usePagedItemsState = createUsePagedItemsState<PresetRegexModel>(
    async options => {
        return await get('/presets/{id}/entries/{entryType}', {params: options})
    });

export const entryState: EntryState<PresetRegexModel> = {
    moduleName, modulePlural, usePagedItemsState, entryType: engineName
};