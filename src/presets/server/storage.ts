import {PresetModel} from "@/presets/models";
import {ModelStorage} from "@/business/server/storage";

export const presetStorage = new ModelStorage<PresetModel>("preset",)
