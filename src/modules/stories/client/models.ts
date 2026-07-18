'use client';
import {createUseItemState, EntryState, ModelState} from "@/business/client/models";
import {createUsePagedItemsState} from "@/components/custom/pager";
import {get} from "@/client";
import {imageEntryName, moduleName, StoryImageModel, StoryModel} from "../models";
import {modulePlural} from "@/modules/presets/models";

export const useItemState = createUseItemState<StoryModel>("story-item-state")
export const usePagedItemsState = createUsePagedItemsState<StoryModel>(
    async options => {
        return await get('/stories', {params: options})
    }, 10);
export const modelState: ModelState<StoryModel> = {
    moduleName, useItemState, usePagedItemsState
};


export const useImagePagedItemsState = createUsePagedItemsState<StoryImageModel>(
    async options => {
        return await get('/stories/{id}/entries/{entryType}', {params: options})
    }, 8);

export const imageEntryState: EntryState<StoryImageModel> = {
    moduleName, modulePlural, usePagedItemsState: useImagePagedItemsState, entryType: imageEntryName
};