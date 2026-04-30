import {BaseModel} from "..";

export interface PresetModel extends BaseModel {
    code: string,
    version: string,
    tags: string[],
}
