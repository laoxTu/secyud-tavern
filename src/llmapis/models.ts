import {BaseModel} from "@/business/models";


export interface LlmapiModel extends BaseModel {
    code: string,
    version: string,
    key?: string,
}


export const moduleName = 'llmapi';
export const moduleArrayName = 'llmapis';