import {EntryModel} from "@/business/models";

export interface PresetMacroModel extends EntryModel {
    key: string,
    value: string,
}

export const engineName = "macro";
export const engineArrayName = "macros";