// src/database/entity-base.ts
import {integer, primaryKey, SQLiteColumn, sqliteTable, text, UpdateDeleteAction} from "drizzle-orm/sqlite-core";
import {presets} from "@/business/preset/db";

export type BaseEntity = { [x: string]: any; };

export function masterTable(tableName: string, extraColumns: any = {}) {
    return sqliteTable(tableName, {
        id: text("id").primaryKey(),
        name: text("name").notNull(),
        content: text("content").notNull(),
        ...extraColumns,
        createdAt: text("created_at").notNull(),
        updatedAt: text("updated_at").notNull(),
    })
}

export function entryTable(tableName: string, masterRef: () => SQLiteColumn, options: {
    onUpdate?: UpdateDeleteAction;
    onDelete?: UpdateDeleteAction;
} | undefined) {
    return sqliteTable(tableName, {
        masterId: text("master_id").notNull().references(masterRef, options),
        entryType: text("entry_type").notNull(),
        entryId: integer("entry_id").notNull(),
        content: text("content").notNull(),
    }, (table) => [
        primaryKey({columns: [table.masterId, table.entryType, table.entryId]})
    ]);
}

export function requireTable(tableName: string, masterRef: () => SQLiteColumn, options: {
    onUpdate?: UpdateDeleteAction;
    onDelete?: UpdateDeleteAction;
} | undefined) {
    return sqliteTable(tableName, {
        masterId: text("master_id").notNull().references(masterRef, options),
        requireId: text("require_id").notNull().references(() => presets.id, {onDelete: "cascade"}),
        version: text("version").notNull(),
    }, (table) => [
        primaryKey({columns: [table.masterId, table.requireId]})
    ]);
}