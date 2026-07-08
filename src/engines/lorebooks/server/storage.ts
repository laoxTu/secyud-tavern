import {PresetModel} from "@/presets/models";
import {presetRepository} from "@/presets/server/repository";
import {createSimpleStorageProvider} from "@/business/server/storage-models";
import {enginePlural, engineName} from "../models";

export const lorebookStorageProvider =
    createSimpleStorageProvider<PresetModel>(engineName, enginePlural, presetRepository);