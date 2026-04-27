import {BaseModel} from "@/models/require";

export interface PresetModel extends BaseModel {
    code: string,
    version: string,
    tags: string[],
}
