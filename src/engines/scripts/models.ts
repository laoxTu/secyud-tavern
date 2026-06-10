import {EntryModel} from "@/business/models";

export interface PresetScriptModel extends EntryModel{
    name: string;
    content: string;
    priority: number;
}

export const engineName = "script";
export const engineArrayName = "scripts";