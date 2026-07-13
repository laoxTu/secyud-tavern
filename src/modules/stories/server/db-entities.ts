import {entryTable, jsonArray, jsonField, masterTable} from "@/business/server/entities";
import {RequireModel} from "@/modules/presets/models";
import {index} from "drizzle-orm/sqlite-core";
import {moduleName} from "@/modules/llmapis/models";

// 存档主表
export const stories = masterTable("story", {
    requires: jsonArray<RequireModel>("requires").default([]),
    llmapi: jsonField<RequireModel | null>("llmapi").default(null),
}, table => [
    index(`${moduleName}_name_idx`).on(table.name),
]);

// 存档从表
export const storyEntries = entryTable(
    "story_entry", () => stories.id, {onDelete: "cascade"});