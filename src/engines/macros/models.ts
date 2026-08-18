import {EntryModel} from "@/business/models";

export interface PresetMacroModel extends EntryModel {
    key: string,
    value: string,
    multiple?: boolean,
    hidden?: boolean,
}

export const engineName = "macro";
export const enginePlural = "macros";