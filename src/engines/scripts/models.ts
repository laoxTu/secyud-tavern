import {EntryModel} from "@/business/models";

export interface PresetScriptModel extends EntryModel {
    content: string;
    priority: number;
    type?: string;
}

export const engineName = "script";
export const enginePlural = "scripts";