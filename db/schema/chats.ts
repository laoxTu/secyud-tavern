// db/schema/chats.ts
import {sqliteTable, text, integer, primaryKey} from "drizzle-orm/sqlite-core";

// 存档主表
export const chats = sqliteTable("chats", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    content: text("content").notNull(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
});

// 存档从表
export const chatEntries = sqliteTable("chat_entries", {
    chatId: text("chat_id").notNull().references(() => chats.id, {onDelete: "cascade"}),
    entryType: text("entry_type").notNull(),
    entryId: integer("entry_id").notNull(),
    content: text("content").notNull(),
}, (table) => [
    primaryKey({columns: [table.chatId, table.entryType, table.entryId]})
]);

// 存档预设
export const chatPresets = sqliteTable("chat_presets", {
    chatId: text("chat_id").notNull().references(() => chats.id, {onDelete: "cascade"}),
    presetId: integer("preset_id").notNull(),
}, (table) => [
    primaryKey({columns: [table.chatId, table.presetId]})
]);