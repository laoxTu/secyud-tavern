import {PresetModel} from "@/modules/presets/models";
import {presetRepository} from "@/modules/presets/server/repository";
import {createSimpleStorageProvider} from "@/business/server/storage-models";
import {enginePlural, engineName, PresetLorebookModel, getLorebookOrder} from "../models";

export const lorebookStorageProvider =
    createSimpleStorageProvider<PresetModel, PresetLorebookModel>(engineName, enginePlural, presetRepository,
        u => `${u.matchType}${u.code}${u.name}`,
        u => `${u.matchType}${String(getLorebookOrder(u)).padStart(9, '0')}`
    );