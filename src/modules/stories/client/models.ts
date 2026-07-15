'use client';
import {createUseItemState, ModelState} from "@/business/client/models";
import {createUsePagedItemsState} from "@/components/custom/pager";
import {get} from "@/client";
import { moduleName, StoryModel} from "../models";

export const useItemState = createUseItemState<StoryModel>()
export const usePagedItemsState = createUsePagedItemsState<StoryModel>(
    async options => {
        return  await get('/stories', {params: options})
    }, 10);
export const modelState: ModelState<StoryModel> = {
    moduleName, useItemState, usePagedItemsState
};