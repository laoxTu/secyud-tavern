// src/business/preset/repository.ts
import {presetEntries, presets} from "./db";
import {createRepository} from "@/database/repository-base";
import {PresetModel} from "@/business/preset/models";
import {presetStorage} from "./";

export const repository =
    createRepository<PresetModel, typeof presets.$inferSelect>(
        presets, presetEntries,
        presetStorage.loadModel.bind(presetStorage),
        presetStorage.saveModel.bind(presetStorage),
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

