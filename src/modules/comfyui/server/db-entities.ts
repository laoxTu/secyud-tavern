import {index, text} from "drizzle-orm/sqlite-core";
import {entryTable, masterTable} from "@/business/server/entities";
import {moduleName} from "@/modules/comfyui/models";
// 模型主表
export const comfyuiModels = masterTable("comfyui_model", {
    code: text("code").notNull().unique(),
    type: text("type").notNull(),
}, table => [
    index(`${moduleName}_model_code_idx`).on(table.code),
    index(`${moduleName}_model_type_idx`).on(table.type),
]);

// 模型从表
export const comfyuiModelEntries = entryTable(
    "comfyui_model_entry", () => comfyuiModels.id, {onDelete: "cascade"});

// 工作流主表
export const comfyuiWorkflows = masterTable("comfyui_workflow", {
    code: text("code").notNull().unique(),
}, table => [
    index(`${moduleName}_workflow_code_idx`).on(table.code),
]);

// 工作流从表
export const comfyuiWorkflowEntries = entryTable(
    "comfyui_workflow_entry", () => comfyuiWorkflows.id, {onDelete: "cascade"});
