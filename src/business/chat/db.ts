// src/business/chat/db.ts
import {entryTable, masterTable, requireTable} from "@/src/db/entity-base";

// 存档主表
export const chats = masterTable("chats");

// 存档从表
export const chatEntries = entryTable(
    "chat_entries", () => chats.id, {onDelete: "cascade"});

// 存档预设
export const chatRequires = requireTable(
    "chat_requires", () => chats.id, {onDelete: "cascade"});