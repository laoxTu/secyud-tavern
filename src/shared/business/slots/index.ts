import {BaseModel} from "@/shared/business";
import {StoryModel} from "@/shared/business/stories";
import {PresetModel} from "@/shared/business/presets";


export interface StoryHistoryMessage {
    id: number;
    content: string;
    variableChanges?: Record<string, any>;
}

export interface StoryHistory {
    id: string;
    timestamp: string;
    variables: Record<string, any>;
    inputs: StoryHistoryMessage[];
    outputs: StoryHistoryMessage[];
}

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

export const name = 'slot'