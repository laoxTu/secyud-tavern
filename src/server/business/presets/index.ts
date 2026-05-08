// src/business/preset/business.ts
import {createRepository} from "@/server/business/repository-base";
import {ModelStorage} from "@/server/business/model-storage";
import {PresetModel} from "@/shared/business/presets";
import {lorebookStorageProvider} from "./lorebooks";
import {regexStorageProvider} from "./regexes";
import {styleStorageProvider} from "./styles";
import {scriptStorageProvider} from "./scripts";
import {presets, presetEntries} from "./database"

export {presets, presetEntries};

export function registerPreset() {
    presetStorage.register(
        lorebookStorageProvider,
        regexStorageProvider,
        styleStorageProvider,
        scriptStorageProvider,
    );
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
            requires: model.requires,
        }),
        (entity): Partial<PresetModel> => ({
            code: entity.code,
            version: entity.version,
            tags: entity.tags,
            requires: entity.requires,
        }))

