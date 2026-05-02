import {entryTable, masterTable} from "@/server/business/entity-base";
import {text} from "drizzle-orm/sqlite-core";

// 存档主表
export const llmapis = masterTable("llmapi",{
    code: text("code").notNull().unique(),
    version: text("version").notNull(),
});

// 存档从表
export const llmapiEntries = entryTable(
    "llmapi_entry", () => llmapis.id, {onDelete: "cascade"});