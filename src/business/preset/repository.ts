// src/business/preset/repository.ts
import {presetEntries, presetRequires, presets} from "./db";
import {createRepository} from "@/database/repository-base";
import storage from "./storage";
import {PresetModel} from "@/business/preset/models";

export const repository =
    createRepository<PresetModel, typeof presets.$inferSelect>(
        presets, presetEntries, presetRequires, storage.loadModel, storage.saveModel,
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

