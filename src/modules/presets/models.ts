import {BaseModel} from "@/business/models";

export interface RequireModel {
    code: string,
    author?: string,
    name?: string,
    version: string,
}

export interface PresetModel extends BaseModel {
    code: string,
    version: string,
    tags: string[],
    requires: RequireModel[],
}


export const moduleName = 'preset';
export const modulePlural = 'presets';