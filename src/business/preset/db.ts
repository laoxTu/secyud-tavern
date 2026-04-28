// src/business/preset/database.ts
import {text} from "drizzle-orm/sqlite-core";
import {entryTable, masterTable} from "@/database/entity-base";

// 预设主表
export const presets = masterTable("db", {
    code: text("code").notNull(),
    version: text("version").notNull(),
    tags: text("tags", {mode: "json"}).$type<string[]>().notNull(),
});

// 预设从表
export const presetEntries = entryTable(
    "preset_entries", () => presets.id, {onDelete: "cascade"});