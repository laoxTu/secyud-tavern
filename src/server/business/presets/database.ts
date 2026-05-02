
import {text} from "drizzle-orm/sqlite-core";
import {entryTable, masterTable} from "@/server/business/entity-base";
// 预设主表
export const presets = masterTable("preset", {
    code: text("code").notNull().unique(),
    version: text("version").notNull(),
    tags: text("tags", {mode: "json"}).$type<string[]>().notNull(),
});

// 预设从表
export const presetEntries = entryTable(
    "preset_entry", () => presets.id, {onDelete: "cascade"});
