import {createRepository} from "@/business/server/repository";
import {PresetModel} from "@/modules/presets/models";
import {presetEntries, presets} from "@/modules/presets/server/db-entities";
import {presetStorage} from "@/modules/presets/server/storage";

export const presetRepository =
    createRepository<PresetModel, typeof presets.$inferSelect>(
        presets, presetEntries, presetStorage,
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
