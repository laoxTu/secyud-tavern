// src/business/preset/business.ts
import {ModelStorage} from "@/server/business/model-storage";
import {lorebookStorageProvider} from "./lorebooks";
import {regexStorageProvider} from "./regexes";
import {styleStorageProvider} from "./styles";
import {scriptStorageProvider} from "./scripts";
import {createRepository} from "@/server/business";
import {PresetModel} from "@/shared/business/presets";
import {presets, presetEntries} from "./database"

export {presets, presetEntries};

export function registerPreset() {
    presetStorage.register(lorebookStorageProvider);
    presetStorage.register(regexStorageProvider);
    presetStorage.register(styleStorageProvider);
    presetStorage.register(scriptStorageProvider);
}

export const presetStorage = new ModelStorage<PresetModel>("preset",)

export const presetRepository =
    createRepository<PresetModel, typeof presets.$inferSelect>(
        presets, presetEntries,
        presetStorage.loadModel.bind(presetStorage),
        presetStorage.saveModel.bind(presetStorage),
        presetStorage.bindSearch.bind(presetStorage),
        (model) => ({
            code: model.code,
            version: model.version,
            tags: model.tags,
        }),
        (entity): Partial<PresetModel> => ({
            code: entity.code,
            version: entity.version,
            tags: entity.tags,
        }))

