
import {text} from "drizzle-orm/sqlite-core";
import {entryTable, jsonArray, masterTable} from "@/server/business/entity-base";
import {RequireModel} from "@/shared/business/presets";
// 预设主表
export const presets = masterTable("preset", {
    code: text("code").notNull().unique(),
    version: text("version").notNull(),
    tags: text("tags", {mode: "json"}).$type<string[]>().notNull(),
    requires: jsonArray<RequireModel>("requires").default([]),
});

// 预设从表
export const presetEntries = entryTable(
    "preset_entry", () => presets.id, {onDelete: "cascade"});
