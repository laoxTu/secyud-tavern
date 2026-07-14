import {moduleName, ComfyUIModelModel, ComfyUIWorkflowModel} from "../models";
import {ModelStorage} from "@/business/server/storage";

export const comfyuiModelStorage = ModelStorage.getInstance<ComfyUIModelModel>(moduleName + "Model",)
export const comfyuiWorkflowStorage = ModelStorage.getInstance<ComfyUIWorkflowModel>(moduleName + "Workflow",)
