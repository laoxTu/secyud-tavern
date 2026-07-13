import {PresetModel} from "@/modules/presets/models";
import {presetRepository} from "@/modules/presets/server/repository";
import {createSimpleStorageProvider} from "@/business/server/storage-models";
import {enginePlural, engineName, PresetStyleModel} from "../models";

export const styleStorageProvider =
    createSimpleStorageProvider<PresetModel, PresetStyleModel>(engineName, enginePlural, presetRepository,
        u => `${u.code}${u.name}`,
        u => `${u.type}${String(u.priority).padStart(5, '0')}`
    );