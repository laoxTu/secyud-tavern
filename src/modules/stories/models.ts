import {BaseModel, EntryModel} from "@/business/models";
import {RequireModel} from "@/modules/presets/models";
import {StoryHistoryMessage} from "@/modules/slots/models";

export interface StoryInputMessage extends StoryHistoryMessage {
    id: number;
}

export interface StoryOutputMessage extends StoryHistoryMessage {
    id: number;
    reasoningContent: string;
}

export interface StoryHistory extends EntryModel {
    outputId: number;
    summary: boolean;
    variables: Record<string, any>;
    inputs: StoryInputMessage[];
    outputs: StoryOutputMessage[];
}

export interface StoryModel extends BaseModel {
    requires: RequireModel[],
    llmapi: RequireModel | null,
    histories?: StoryHistory[]
}

export interface StoryImageModel extends EntryModel {
    imageId: string;
}

export const moduleName = 'story';
export const modulePlural = 'stories';

export const imageEntryName = 'image';
export const imageEntryPlural = 'images';