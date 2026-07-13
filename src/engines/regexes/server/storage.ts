import {PresetModel} from "@/modules/presets/models";
import {presetRepository} from "@/modules/presets/server/repository";
import {createSimpleStorageProvider} from "@/business/server/storage-models";
import {enginePlural, engineName, PresetRegexModel} from "../models";

export const regexStorageProvider =
    createSimpleStorageProvider<PresetModel, PresetRegexModel>(engineName, enginePlural, presetRepository,
        u => `${u.code}${u.name}`,
        u => `${u.target}${u.code}`
    );