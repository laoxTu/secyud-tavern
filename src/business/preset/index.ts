// src/business/preset/index.ts
import {BaseModel} from "@/src/model/require";

export interface PresetModel extends BaseModel {
    version: string;
    tags: string[],
}


export { default as presetStorage } from "./storage";