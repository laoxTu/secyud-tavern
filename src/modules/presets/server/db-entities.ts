import {index, text} from "drizzle-orm/sqlite-core";
import {entryTable, jsonArray, masterTable} from "@/business/server/entities";
import {moduleName, RequireModel} from "@/modules/presets/models";
// 预设主表
export const presets = masterTable("preset", {
    code: text("code").notNull().unique(),
    version: text("version").notNull(),
    tags: text("tags", {mode: "json"}).$type<string[]>().notNull(),
    requires: jsonArray<RequireModel>("requires").default([]),
}, table => [
    index(`${moduleName}_code_idx`).on(table.code),
]);

// 预设从表
export const presetEntries = entryTable(
    "preset_entry", () => presets.id, {onDelete: "cascade"});
