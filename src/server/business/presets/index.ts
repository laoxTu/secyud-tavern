// src/business/preset/business.ts
import {text} from "drizzle-orm/sqlite-core";
import {entryTable, masterTable} from "@/server/business/entity-base";
import {ModelStorage} from "@/server/business/model-storage";
import {lorebookStorageProvider} from "./lorebook";
import {regexStorageProvider} from "./regex";
import {styleStorageProvider} from "./style";
import {scriptStorageProvider} from "./script";
import {createRepository} from "@/server/business";
import {PresetModel} from "@/shared/business/presets";

export function registerPreset() {
    presetStorage.register(lorebookStorageProvider);
    presetStorage.register(regexStorageProvider);
    presetStorage.register(styleStorageProvider);
    presetStorage.register(scriptStorageProvider);
}

export const presetStorage = new ModelStorage<PresetModel>("preset",)

// 预设主表
export const presets = masterTable("db", {
    code: text("code").notNull().unique(),
    version: text("version").notNull(),
    tags: text("tags", {mode: "json"}).$type<string[]>().notNull(),
});

// 预设从表
export const presetEntries = entryTable(
    "preset_entries", () => presets.id, {onDelete: "cascade"});

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

