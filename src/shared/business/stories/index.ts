import {BaseModel} from "..";
import {RequireModel} from "@/shared/business/presets";

export interface StoryModel extends BaseModel
{
    requires: RequireModel[],
}