'use client';
import {createUseItemState, ModelState} from "@/business/client/models";
import {createUsePagedItemsState} from "@/components/custom/pager";
import {get} from "@/client";
import { moduleName, modulePlural, StoryModel} from "../models";

export const useItemState = createUseItemState<StoryModel>()
export const usePagedItemsState = createUsePagedItemsState<StoryModel>(
    async options => {
        return  await get('/stories', {params: options})
    });
export const modelState: ModelState<StoryModel> = {
    moduleName, modulePlural, useItemState, usePagedItemsState
};