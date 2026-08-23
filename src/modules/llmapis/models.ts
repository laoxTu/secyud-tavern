import {BaseModel} from "@/business/models";
import {RequireModel} from "@/modules/presets/models";

export interface LlmapiModel extends BaseModel {
    code: string,
    version: string,
    stream: boolean,
    // 模型供应者
    provider?: string,
    // api key secret
    key?: string,
    iv?: Buffer,
    builder?: string,
}

export function convertToRequire(llmapi: LlmapiModel) {
    return {
        code: llmapi.code,
        version: llmapi.version,
        name: llmapi.name,
        author: llmapi.provider,
    } as RequireModel;
}

export const moduleName = 'llmapi';
export const modulePlural = 'llmapis';