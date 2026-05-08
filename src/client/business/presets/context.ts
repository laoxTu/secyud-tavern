import {createModelContextType, useModelContext} from "@/client/business/template/context";
import {PresetModel,name as modelType} from "@/shared/business/presets";

export const modelApi = "presets";
export const PresetContext = createModelContextType<PresetModel>();
export const usePresetContext = (t: any) =>
    useModelContext<PresetModel>(PresetContext, modelType, t)