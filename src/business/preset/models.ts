import {BaseModel} from "@/src/models/require";

export interface PresetModel extends BaseModel {
    version: string;
    tags: string[],
}
