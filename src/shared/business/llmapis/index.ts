import {BaseModel} from "..";

export interface LlmapiModel extends BaseModel {
    code: string,
    version: string,
    key?: string,
}


export const name = 'llmapi'