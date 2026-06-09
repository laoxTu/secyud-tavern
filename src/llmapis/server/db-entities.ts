import {entryTable, masterTable} from "@/business/server/entities";
import {text} from "drizzle-orm/sqlite-core";
import {moduleName} from "../models";

// 存档主表
export const llmapis = masterTable(moduleName, {
    code: text("code").notNull().unique(),
    key: text("key"),
    version: text("version").notNull(),
});

// 存档从表
export const llmapiEntries = entryTable(
    `${moduleName}_entry`, () => llmapis.id, {onDelete: "cascade"});