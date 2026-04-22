// db/schema/presets.ts
import {sqliteTable, text, integer, primaryKey} from "drizzle-orm/sqlite-core";

// 预设主表
export const presets = sqliteTable("presets", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    version: text("version").notNull(),
    tags: text("tags", {mode: "json"}).$type<string[]>().notNull(),
    content: text("content").notNull(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
});

// 预设从表
export const presetEntries = sqliteTable("preset_entries", {
    presetId: text("preset_id").notNull().references(() => presets.id, {onDelete: "cascade"}),
    entryType: text("entry_type").notNull(),
    entryId: integer("entry_id").notNull(),
    content: text("content").notNull(),
}, (table) => [
    primaryKey({columns: [table.presetId, table.entryType, table.entryId]})
]);

// 预设依赖
export const presetRequires = sqliteTable("preset_requires", {
    presetId: text("preset_id").notNull().references(() => presets.id, {onDelete: "cascade"}),
    requireId: integer("require_id").notNull().references(() => presets.id, {onDelete: "cascade"}),
}, (table) => [
    primaryKey({columns: [table.presetId, table.requireId]})
]);