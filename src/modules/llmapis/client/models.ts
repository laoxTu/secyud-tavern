'use client';
import {createUseItemState, ModelState} from "@/business/client/models";
import {createUsePagedItemsState} from "@/components/custom/pager";
import {get} from "@/client";
import {LlmapiModel, moduleName, modulePlural} from "../models";

export const useItemState = createUseItemState<LlmapiModel>()
export const usePagedItemsState = createUsePagedItemsState<LlmapiModel>(
    async options => {
        return await get('/llmapis', {params: options})
    }, 10);
export const modelState: ModelState<LlmapiModel> = {
    moduleName, useItemState, usePagedItemsState
};