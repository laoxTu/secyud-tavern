import {entryTable, masterTable} from "@/business/server/entities";
import {index, text} from "drizzle-orm/sqlite-core";
import {moduleName} from "../models";

// 存档主表
export const llmapis = masterTable(moduleName, {
    code: text("code").notNull().unique(),
    provider: text("provider"),
    builder: text("builder"),
    key: text("key"),
    version: text("version").notNull(),
}, table => [
    index(`${moduleName}_code_idx`).on(table.code),
]);

// 存档从表
export const llmapiEntries = entryTable(
    `${moduleName}_entry`, () => llmapis.id, {onDelete: "cascade"});