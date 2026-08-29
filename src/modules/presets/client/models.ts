import {createUseItemState, ModelState} from "@/business/client/models";
import {createUsePagedItemsState} from "@/components/custom/pager";
import {get, post} from "@/client";
import {moduleName, PresetModel} from "../models";

export const useItemState =
    createUseItemState<PresetModel>(async (id) => {
        return await get('/presets/{id}', {
            params: {
                id,
                withExistEntries: true
            }
        });
    })
export const usePagedItemsState =
    createUsePagedItemsState<PresetModel>(async options => {
        return await get('/presets', {params: options})
    }, 7);
export const modelState: ModelState<PresetModel> = {
    moduleName, useItemState, usePagedItemsState, pasteEntry: async (entry, type) => {
        await post("/presets/{id}/entries/{entryType}", entry, {
            params: {
                entryType: type,
                id: useItemState.getState().model?.id
            }
        })
    }
};
export const defaultTags = [
    "theme", "story", "preset"
];