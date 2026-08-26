import {createSimpleStorageProvider} from "@/business/server/storage-models";
import {engineName, enginePlural, PresetToolConfigModel} from "../models";
import {PresetModel} from "@/modules/presets/models";
import {presetRepository} from "@/modules/presets/server/repository";

export const toolStorageProvider =
    createSimpleStorageProvider<PresetModel, PresetToolConfigModel>(
        engineName, enginePlural, presetRepository
    );