import {EntryModel} from "@/business/models";

export interface PresetRegexModel extends EntryModel{
    pattern: string,
    replacement: string,
    target: string,
    layerMin: number,
    layerMax: number,
}

export const engineName = "regex";
export const engineArrayName = "regexes";