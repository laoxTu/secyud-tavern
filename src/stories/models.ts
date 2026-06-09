import {BaseModel} from "@/business/models";
import {PresetModel, RequireModel} from "@/presets/models";

export interface StoryModel extends BaseModel {
    requires: RequireModel[],
    llmapi: RequireModel | null,
}

export interface StoryHistoryMessage {
    id: number;
    content: string;
    variables?: Record<string, any>;
}

export interface StoryHistory {
    id: string;
    outputIndex: number;
    timestamp: string;
    variables: Record<string, any>;
    inputs: StoryHistoryMessage[];
    outputs: StoryHistoryMessage[];
}


export const moduleName = 'story';
export const moduleArrayName = 'stories';