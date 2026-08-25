'use client';
import {EntryState} from "@/business/client/models";
import {createUsePagedItemsState} from "@/components/custom/pager";
import {get} from "@/client";
import {moduleName, modulePlural} from "@/modules/presets/models";
import {engineName, PresetLorebookModel} from "../models";
import {refreshItem} from "@/modules/presets/client/tabs";
import {RagModel} from "@/engines/rags/client/models";

export const lorebookSchema = {
    name: "string",
} as const;

export interface LorebookConversationCache {
    before: PresetLorebookModel[],
    after: PresetLorebookModel[],
    entries: Record<string, PresetLorebookModel>,
    rag: RagModel<typeof lorebookSchema> | null,
}

export const usePagedItemsState = createUsePagedItemsState<PresetLorebookModel>(
    async options => {
        return await get('/presets/{id}/entries/{entryType}', {params: options})
    });

export const entryState: EntryState<PresetLorebookModel> = {
    moduleName, modulePlural, usePagedItemsState, entryType: engineName,
    refreshItem
};