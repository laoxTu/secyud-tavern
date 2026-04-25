import {BaseModel} from "@/models/require";

export interface PresetModel extends BaseModel {
    version: string;
    tags: string[],
}
