import {BaseModel} from "@/business/models";
import {PresetModel} from "@/presets/models";
import {StoryModel} from "@/stories/models";


export interface SlotModel extends BaseModel {
    story: StoryModel,
    presets: PresetModel[],
}

export interface LlmMessage {
    role: string,
    content: string,
    name?: string,
}

export interface LlmInputModel {
    messages: LlmMessage[];
}

export const moduleName = 'slot';
export const moduleArrayName = 'slots';