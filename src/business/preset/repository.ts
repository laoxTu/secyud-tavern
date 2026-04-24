// src/business/preset/repository.ts
import {presetEntries, presetRequires, presets} from "./db";
import {createRepository} from "@/src/db/repository-base";
import storage from "./storage";
import {PresetModel} from "@/src/business/preset/models";

export const repository =
    createRepository<PresetModel, typeof presets.$inferSelect>(
        presets, presetEntries, presetRequires, storage.loadModel, storage.saveModel,
        (model) => ({
            version: model.version,
            tags: model.tags,
        }),
        (entity): Partial<PresetModel> => ({
            version: entity.version,
            tags: entity.tags,
        }))

