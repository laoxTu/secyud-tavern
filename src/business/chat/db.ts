// src/business/chat/database.ts
import {entryTable, masterTable} from "@/database/entity-base";

// 存档主表
export const chats = masterTable("chats");

// 存档从表
export const chatEntries = entryTable(
    "chat_entries", () => chats.id, {onDelete: "cascade"});
