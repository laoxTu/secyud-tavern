import {SlotHistory} from "@/modules/models";
import {PresetModel, RequireModel} from "@/modules/presets/models";
import {JsonSchema} from "@/utils/json-schema";
import {LlmapiModel} from "@/modules/llmapis/models";
import {BaseModel, EntryModel} from "@/business/models";


export interface StoryModel extends BaseModel {
    requires: RequireModel[],
    llmapi: RequireModel | null,
}

export interface SlotModel extends StoryModel {
    initialized?: boolean;
    llmapi: LlmapiModel,
    histories: (SlotHistory | null)[],
    presets: PresetModel[],
    properties: Record<string, any>,
}

export interface LlmapiToolModel {
    name: string,
    description: string,
    parameters: JsonSchema
}

export interface StoryImageModel extends EntryModel {
    imageId: string | null;
}

export const moduleName = 'story';
export const modulePlural = 'stories';

export const imageEntryName = 'image';
export const imageEntryPlural = 'images';
