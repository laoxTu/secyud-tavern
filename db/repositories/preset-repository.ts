// db/repositories/preset-repository.ts
import {presetEntries, presetRequires, presets} from "../schema/presets";
import {PresetModel} from "@/models/preset-model";
import {presetManager} from "@/services/preset/preset-manager";
import {createRepository} from "@/db/repositories/repository-base";


export const presetRepository =
    createRepository<PresetModel, typeof presets.$inferSelect>(
        presets, presetEntries, presetRequires, presetManager.loadModel, presetManager.saveModel,
        (model) => ({
            version: model.version,
            tags: model.tags,
        }),
        (entity): Partial<PresetModel> => ({
            version: entity.version,
            tags: entity.tags,
        }))

