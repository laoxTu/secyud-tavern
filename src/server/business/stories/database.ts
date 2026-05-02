import {entryTable, jsonArray, masterTable} from "@/server/business/entity-base";
import {RequireModel} from "@/shared/business/presets";

// 存档主表
export const stories = masterTable("story", {
    requires: jsonArray<RequireModel>("requires").default([]),
});

// 存档从表
export const storyEntries = entryTable(
    "story_entry", () => stories.id, {onDelete: "cascade"});