import {EntryModel} from "@/business/models";

export interface PresetScriptModel extends EntryModel{
    content: string;
    priority: number;
}

export const engineName = "script";
export const engineArrayName = "scripts";