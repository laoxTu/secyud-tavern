import {createRepository} from "@/business/server/repository";
import {
    comfyuiModelEntries,
    comfyuiModels,
    comfyuiWorkflowEntries,
    comfyuiWorkflows
} from "@/modules/comfyui/server/db-entities";
import {ComfyUIModelModel, ComfyUIWorkflowModel} from "@/modules/comfyui/models";
import {comfyuiModelStorage, comfyuiWorkflowStorage} from "@/modules/comfyui/server/storage";

export const comfyuiModelRepository =
    createRepository<ComfyUIModelModel, typeof comfyuiModels.$inferSelect>(
        comfyuiModels, comfyuiModelEntries, comfyuiModelStorage,
        (model) => ({
            code: model.code,
            type: model.type,
        }),
        (entity) => ({
            code: entity.code,
            type: entity.type,
        }))

export const comfyuiWorkflowRepository =
    createRepository<ComfyUIWorkflowModel, typeof comfyuiWorkflows.$inferSelect>(
        comfyuiWorkflows, comfyuiWorkflowEntries, comfyuiWorkflowStorage,
        (model) => ({
            code: model.code,
        }),
        (entity) => ({
            code: entity.code,
        }))
