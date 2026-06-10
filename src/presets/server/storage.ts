import {moduleName, PresetModel} from "../models";
import {ModelStorage} from "@/business/server/storage";

export const presetStorage = new ModelStorage<PresetModel>(moduleName,)
