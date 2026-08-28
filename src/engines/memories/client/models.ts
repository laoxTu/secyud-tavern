import {RagModel} from "@/engines/rags/client/models";
import {SlotMessageOutput} from "@/modules/models/message";
import {EntryState} from "@/business/client/models";
import {createUsePagedItemsState} from "@/components/custom/pager";
import {get} from "@/client";
import {moduleName, modulePlural} from "@/modules/stories/models";
import {engineName, StoryMemoryModel} from "../models";
import {refreshItem} from "@/modules/stories/client/tabs";

export const usePagedItemsState = createUsePagedItemsState<StoryMemoryModel>(
    async options => {
        return await get('/stories/{id}/entries/{entryType}', {params: options})
    });

export const entryState: EntryState<StoryMemoryModel> = {
    moduleName, modulePlural, usePagedItemsState, entryType: engineName, refreshItem
};

export const memorySchema = {
    entryId: 'number',
    code: 'string',
    tags: 'string[]',
    type: 'string',
    importance: "number",
    sequence: "number",
} as const;

export interface MemoryConversationCache {
    rag: RagModel<typeof memorySchema> | null,
    memories: Record<string, StoryMemoryModel>,
}

export function getMemoryCodes(message: SlotMessageOutput, create: boolean = true) {
    const propertyName = "memoryCodes";
    let memoryCodes: number[][] = message.properties[propertyName];
    if (!memoryCodes && create) {
        memoryCodes = [];
        message.properties[propertyName] = memoryCodes;
    }
    return memoryCodes;
}