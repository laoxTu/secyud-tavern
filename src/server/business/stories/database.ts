import {entryTable, masterTable} from "@/server/business/entity-base";

// 存档主表
export const stories = masterTable("story");

// 存档从表
export const storyEntries = entryTable(
    "story_entry", () => stories.id, {onDelete: "cascade"});