import {createSimpleStorageProvider} from "@/business/server/storage-models";
import {
    ComfyUIParameterModel,
    ComfyUIWorkflowModel,
    parameterEntryName,
    parameterEntryPlural
} from "@/modules/comfyui/models";
import {comfyuiWorkflowRepository} from "@/modules/comfyui/server/repository";

export const parameterStorageProvider =
    createSimpleStorageProvider<ComfyUIWorkflowModel, ComfyUIParameterModel>(
        parameterEntryName, parameterEntryPlural, comfyuiWorkflowRepository,
        u => `${u.code}${u.name}`,
        u => `${u.type}${String(u.priority).padStart(5, '0')}`
    );