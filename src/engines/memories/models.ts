import {EntryModel} from "@/business/models";

export interface StoryMemoryModel extends EntryModel {
    text: string,
    sequence: number,
    importance: number,
    type: string,
    tags: string[],
}

export interface MemoryToolConfigModel {
}

export const engineName = "memory";
export const enginePlural = "memories";