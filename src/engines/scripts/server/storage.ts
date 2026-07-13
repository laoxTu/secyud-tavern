import {PresetModel} from "@/modules/presets/models";
import {presetRepository} from "@/modules/presets/server/repository";
import {createSimpleStorageProvider} from "@/business/server/storage-models";
import {enginePlural, engineName, PresetScriptModel} from "../models";

export const scriptStorageProvider =
    createSimpleStorageProvider<PresetModel, PresetScriptModel>(engineName, enginePlural, presetRepository,
        u => `${u.code}${u.name}`,
        u => `${u.type}${String(u.priority).padStart(5, '0')}`
    );