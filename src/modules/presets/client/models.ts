import {createUseItemState, ModelState} from "@/business/client/models";
import {createUsePagedItemsState} from "@/components/custom/pager";
import {get} from "@/client";
import {PresetModel, moduleName, modulePlural} from "../models";

export const useItemState =
    createUseItemState<PresetModel>()
export const usePagedItemsState =
    createUsePagedItemsState<PresetModel>(async options => {
        return await get('/presets', {params: options})
    }, 10);
export const modelState: ModelState<PresetModel> = {
    moduleName, useItemState, usePagedItemsState
};
export const defaultTags = [
    "theme", "story", "preset"
];