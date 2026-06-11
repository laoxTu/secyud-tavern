import {BaseModel} from "@/business/models";
import {PresetModel} from "@/presets/models";
import {StoryModel} from "@/stories/models";
import {LlmapiModel} from "@/llmapis/models";


export interface SlotModel extends BaseModel {
    story: StoryModel,
    presets: PresetModel[],
    llmapi: LlmapiModel
}

export interface LlmapiMessage {
    role: "system" | "user" | "assistant";
    content: string,
}

export interface LlmapiInputModel {
    messages: LlmapiMessage[];
}


export const moduleName = 'slot';
export const moduleArrayName = 'slots';