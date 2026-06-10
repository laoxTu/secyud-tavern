import {BaseModel} from "@/business/models";


export interface LlmapiModel extends BaseModel {
    code: string,
    version: string,
    // api key secret
    key?: string,
}


export const moduleName = 'llmapi';
export const moduleArrayName = 'llmapis';