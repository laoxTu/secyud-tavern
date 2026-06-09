import {createModelContextType, useModelContext} from "@/components/template/models";
import {PresetModel, moduleName} from "../models";

export const PresetContext = createModelContextType<PresetModel>();
export const usePresetContext = (t: any) =>
    useModelContext<PresetModel>(PresetContext, moduleName, t)