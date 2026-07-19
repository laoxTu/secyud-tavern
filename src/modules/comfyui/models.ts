import {BaseModel, EntryModel} from "@/business/models";

export interface ComfyUISettingState {
    baseUrl: string;
    clientId: string;
    modelDir: string;
}

// ComfyUI 模型
export interface ComfyUIModelModel extends BaseModel {
    code: string;
    type: string;
}

export interface ComfyUIModelContentModel {
    coverId?: string,
    coverSrc?: string,
    description?: string,
    path?: string,
    url?: string,
    html?: string,
    baseModel?: string,
    downloadUrl?: string,
}

// ComfyUI 工作流
export interface ComfyUIWorkflowModel extends BaseModel {
    code: string;
}

export interface ComfyUIWorkflowInput {
    [key: string]: {
        inputs: Record<string, number | string | boolean | [string, number] | any>;
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
export const parameterEntryPlural = 'parameters';