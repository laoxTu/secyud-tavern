import {BaseModel} from "@/business/models";
import {PresetModel} from "@/modules/presets/models";
import {StoryModel} from "@/modules/stories/models";
import {LlmapiModel} from "@/modules/llmapis/models";


export interface SlotModel extends BaseModel {
    story: StoryModel,
    presets: PresetModel[],
    llmapi: LlmapiModel
}

export interface LlmapiMessage {
    role: string; //"system" | "user" | "assistant"
    content: string,
}

export interface LlmapiInputModel {
    messages: LlmapiMessage[];
}


export const moduleName = 'slot';
export const moduleArrayName = 'slots';