import {BaseModel} from "..";
import {RequireModel} from "@/shared/business/presets";

export interface StoryModel extends BaseModel {
    requires: RequireModel[],
    llmapi: RequireModel | null,
}

export const name = 'story'