'use client';
import {createUseItemState, ModelState} from "@/business/client/models";
import {createUsePagedItemsState} from "@/components/custom/pager";
import {get} from "@/client";
import {LlmapiModel, moduleName} from "../models";

export const useItemState = createUseItemState<LlmapiModel>(
    async id => {
        return await get('/llmapis/{id}', {params: {id}})
    }
)
export const usePagedItemsState = createUsePagedItemsState<LlmapiModel>(
    async options => {
        return await get('/llmapis', {params: options})
    }, 7);
export const modelState: ModelState<LlmapiModel> = {
    moduleName, useItemState, usePagedItemsState
};