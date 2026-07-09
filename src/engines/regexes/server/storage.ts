import {PresetModel} from "@/modules/presets/models";
import {presetRepository} from "@/modules/presets/server/repository";
import {createSimpleStorageProvider} from "@/business/server/storage-models";
import {enginePlural, engineName} from "../models";

export const regexStorageProvider =
    createSimpleStorageProvider<PresetModel>(engineName, enginePlural, presetRepository);