import {BaseModel} from "@/business/models";

// ComfyUI 模型
export interface ComfyUIModelModel extends BaseModel {
    code: string;
    type: string;
}

// ComfyUI 工作流
export interface ComfyUIWorkflowModel extends BaseModel {
    code: string;
}


export const modelTypes = ["vae", "diffusion_model", "lora", "text_encoder", "checkpoint"];

export const moduleName = 'comfyui';
export const modulePlural = 'comfyuis';