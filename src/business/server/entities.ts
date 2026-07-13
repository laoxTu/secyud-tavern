import {index, integer, primaryKey, SQLiteColumn, sqliteTable, text, UpdateDeleteAction} from "drizzle-orm/sqlite-core";
import {customType} from "drizzle-orm/sqlite-core";

export type BaseEntity = { [x: string]: any; };

export const jsonArray = <T = any>(name: string) =>
    customType<{ data: T[]; driverData: string }>({
        dataType() {
            return 'text';
        },
        fromDriver(value: string): T[] {
            if (!value) return [];
            return JSON.parse(value);
        },
        toDriver(value: T[]): string {
            if (!value) return '[]';
            return JSON.stringify(value);
        },
    })(name);

export const jsonField = <T = any>(name: string) =>
    customType<{ data: T; driverData: string }>({
        dataType() {
            return 'text';
        },
        fromDriver(value: string): T {
            if (!value) return null as T;
            return JSON.parse(value);
        },
        toDriver(value: T): string {
            if (!value) return 'null';
            return JSON.stringify(value);
        },
    })(name);

export function masterTable(tableName: string, extraColumns: any = {}, options: (table: any) => any[]) {
    return sqliteTable(tableName, {
        id: text("id").primaryKey(),
        name: text("name").notNull(),
        content: text("content").notNull(),
        ...extraColumns,
        createdAt: text("created_at").notNull(),
        updatedAt: text("updated_at").notNull(),
    }, options)
}

export function entryTable(tableName: string, masterRef: () => SQLiteColumn, options: {
    onUpdate?: UpdateDeleteAction;
    onDelete?: UpdateDeleteAction;
} | undefined) {
    return sqliteTable(tableName, {
        masterId: text("master_id").notNull().references(masterRef, options),
        entryType: text("entry_type").notNull(),
        entryId: integer("entry_id").notNull(),
        search: text("search").notNull().default(''),
        sorter: text("sorter").notNull().default(''),
        disabled: integer("disabled", {mode: 'boolean'}).notNull().default(false),
        content: text("content").notNull(),
    }, (table) => [
        primaryKey({columns: [table.masterId, table.entryType, table.entryId]}),
        index(`${tableName}_search_idx`).on(table.search),
        index(`${tableName}_sorter_idx`).on(table.sorter),
    ]);
}