'use client';
import {createUseItemState, EntryState, ModelState} from "@/business/client/models";
import {createUsePagedItemsState} from "@/components/custom/pager";
import {get} from "@/client";
import {
    ComfyUIModelModel,
    ComfyUIParameterModel, ComfyUISettingState,
    ComfyUIWorkflowModel,
    moduleName,
    parameterEntryName
} from "../models";
import {modulePlural} from "@/modules/presets/models";
import {create} from "zustand";
import {createJSONStorage, persist} from "zustand/middleware";
import {remoteStorage} from "@/modules/settings/client/models";

/**
 * comfyui 我们主要关注的是工作流的联动
 * 借助工作流和llm生成提示词，从而增加生图效率
 * 所以主item设置为 workflow
 */
export const useItemState = createUseItemState<ComfyUIWorkflowModel>()
export const usePagedItemsState = createUsePagedItemsState<ComfyUIWorkflowModel>(
    async options => {
        return await get('/comfyuis/workflows', {params: options})
    }, 10);


export const modelState: ModelState<ComfyUIWorkflowModel> = {
    moduleName: `${moduleName}_workflow`, useItemState, usePagedItemsState
};

/**
 * 模型管理是一个很好的东西，但是它在tavern中不是主要关注对象，
 * 这里用Model词缀标识。
 */
export const useModelPagedItemsState = createUsePagedItemsState<ComfyUIModelModel>(
    async options => {
        return await get('/comfyuis/models', {params: options})
    }, 8);


export const useParameterPagedItemsState = createUsePagedItemsState<ComfyUIParameterModel>(
    async options => {
        return await get('/comfyuis/workflows/{id}/entries/{entryType}', {params: options})
    });

export const parameterEntryState: EntryState<ComfyUIParameterModel> = {
    moduleName, modulePlural, usePagedItemsState: useParameterPagedItemsState, entryType: parameterEntryName
};



export const useComfyUISettingState = create<ComfyUISettingState>()(
    persist<ComfyUISettingState>(() => ({
            baseUrl: "http://localhost:8188",
            clientId: "secyud-tavern",
            modelDir: "",
        }),
        {
            name: "comfyuiSettingState",
            storage: createJSONStorage(() => remoteStorage),
            partialize: (state) => ({
                baseUrl: state.baseUrl,
                clientId: state.clientId,
                modelDir: state.modelDir,
            }),
        }
    )
);
