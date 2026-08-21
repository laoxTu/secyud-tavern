import {entryTable, masterTable} from "@/business/server/entities";
import {blob, index, integer, text} from "drizzle-orm/sqlite-core";
import {moduleName} from "../models";

// 存档主表
export const llmapis = masterTable(moduleName, {
    code: text("code").notNull().unique(),
    provider: text("provider"),
    builder: text("builder"),
    key: text("key"),
    stream: integer("stream", {mode: 'boolean'}).notNull().default(false),
    iv: blob('iv', {mode: 'buffer'}),
    version: text("version").notNull(),
}, table => [
    index(`${moduleName}_code_idx`).on(table.code),
]);

// 存档从表
export const llmapiEntries = entryTable(
    `${moduleName}_entry`, () => llmapis.id, {onDelete: "cascade"});