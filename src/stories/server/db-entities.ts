import {entryTable, jsonArray, jsonField, masterTable} from "@/business/server/entities";
import {RequireModel} from "@/presets/models";

// 存档主表
export const stories = masterTable("story", {
    requires: jsonArray<RequireModel>("requires").default([]),
    llmapi: jsonField<RequireModel | null>("llmapi").default(null),
});

// 存档从表
export const storyEntries = entryTable(
    "story_entry", () => stories.id, {onDelete: "cascade"});