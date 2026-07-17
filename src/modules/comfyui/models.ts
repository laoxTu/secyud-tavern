import {BaseModel, EntryModel} from "@/business/models";

// ComfyUI 模型
export interface ComfyUIModelModel extends BaseModel {
    code: string;
    type: string;
}

// ComfyUI 工作流
export interface ComfyUIWorkflowModel extends BaseModel {
    code: string;
}

export interface ComfyUIWorkflowInput {
    [key: string]: {
        inputs: {
            [key: string]: number | string | boolean | [string, number] | any;
        }
        class_type: string;
        _meta: {
            title: string;
        }
    };
}

export interface ComfyUIParameterModel extends EntryModel {
    type: string;
    priority: number;
    config: any;
}


export const modelTypes = ["vae", "diffusion_model", "lora", "text_encoder", "checkpoint"];

export const moduleName = 'comfyui';
export const modulePlural = 'comfyuis';

export const parameterEntryName = 'parameter';