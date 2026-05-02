import {createModelContextType, useModelContext} from "@/client/business/template/context";
import {PresetModel} from "@/shared/business/presets";

export const modelType = "preset";
export const modelApi = "presets";
export const PresetContext = createModelContextType<PresetModel>();
export const usePresetContext = (t: any) =>
    useModelContext<PresetModel>(PresetContext, modelType, t)