// models/preset-model.ts
import {BaseModel} from "@/models/common-types";

export interface PresetModel extends BaseModel {
    version: string;
    tags: string[],
}

