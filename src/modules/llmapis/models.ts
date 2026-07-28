import {BaseModel} from "@/business/models";


export interface LlmapiModel extends BaseModel {
    code: string,
    version: string,
    // 模型供应者
    provider?: string,
    // api key secret
    key?: string,
    iv?: Buffer,
    builder?: string,
}


export const moduleName = 'llmapi';
export const modulePlural = 'llmapis';