'use client';
import {createUseItemState, ModelState} from "@/business/client/models";
import {createUsePagedItemsState} from "@/components/custom/pager";
import {get} from "@/client";
import {ComfyUIWorkflowModel, moduleName, modulePlural} from "../models";

export const useItemState = createUseItemState<ComfyUIWorkflowModel>()
export const usePagedItemsState = createUsePagedItemsState<ComfyUIWorkflowModel>(
    async options => {
        return await get('/llmapis', {params: options})
    }, 10);
export const modelState: ModelState<ComfyUIWorkflowModel> = {
    moduleName, modulePlural, useItemState, usePagedItemsState
};