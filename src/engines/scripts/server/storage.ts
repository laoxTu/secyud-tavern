import {PresetModel} from "@/presets/models";
import {presetRepository} from "@/presets/server/repository";
import {createSimpleStorageProvider} from "@/business/server/storage-models";
import {engineArrayName, engineName} from "../models";

export const scriptStorageProvider =
    createSimpleStorageProvider<PresetModel>(engineName, engineArrayName, presetRepository);