import {BaseModel, EntryModel} from "@/business/models";
import {RequireModel} from "@/modules/presets/models";
import {SlotHistory} from "@/modules/models";

export interface StoryModel extends BaseModel {
    requires: RequireModel[],
    llmapi: RequireModel | null,
    histories?: SlotHistory[]
}

export interface StoryImageModel extends EntryModel {
    imageId: string;
}

export const moduleName = 'story';
export const modulePlural = 'stories';

export const imageEntryName = 'image';
export const imageEntryPlural = 'images';
