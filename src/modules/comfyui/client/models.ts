'use client';
import {createUseItemState, ModelState} from "@/business/client/models";
import {createUsePagedItemsState} from "@/components/custom/pager";
import {get} from "@/client";
import {ComfyUIModelModel, ComfyUIWorkflowModel, moduleName, modulePlural} from "../models";

export const useItemState = createUseItemState<ComfyUIWorkflowModel>()
export const usePagedItemsState = createUsePagedItemsState<ComfyUIWorkflowModel>(
    async options => {
        return await get('/comfyuis/workflows', {params: options})
    }, 10);

export const useModelPagedItemsState = createUsePagedItemsState<ComfyUIModelModel>(
    async options => {
        return await get('/comfyuis/models', {params: options})
    }, 8);

export const modelState: ModelState<ComfyUIWorkflowModel> = {
    moduleName: `${moduleName}_workflow`, useItemState, usePagedItemsState
};