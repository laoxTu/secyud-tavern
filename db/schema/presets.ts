// db/schema/presets.ts
import {text} from "drizzle-orm/sqlite-core";
import {entryTable, masterTable, requireTable} from "@/db/schema/entity-base";

// 预设主表
export const presets = masterTable("presets", {
    version: text("version").notNull(),
    tags: text("tags", {mode: "json"}).$type<string[]>().notNull(),
});

// 预设从表
export const presetEntries = entryTable(
    "preset_entries", () => presets.id, {onDelete: "cascade"});

// 预设依赖
export const presetRequires = requireTable(
    "preset_requires", () => presets.id, {onDelete: "cascade"});