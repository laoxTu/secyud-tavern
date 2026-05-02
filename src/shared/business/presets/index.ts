import {BaseModel} from "..";

export interface RequireModel {
    code: string,
    version: string,
}

export interface PresetModel extends BaseModel {
    code: string,
    version: string,
    tags: string[],
    requires: RequireModel[],
}
