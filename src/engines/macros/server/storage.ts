import {PresetModel} from "@/modules/presets/models";
import {presetRepository} from "@/modules/presets/server/repository";
import {createSimpleStorageProvider} from "@/business/server/storage-models";
import {enginePlural, engineName, PresetMacroModel} from "../models";

export const macroStorageProvider =
    createSimpleStorageProvider<PresetModel, PresetMacroModel>(engineName, enginePlural, presetRepository,
        u => `${u.code}${u.name}`,
        u => `${u.key}`
    );