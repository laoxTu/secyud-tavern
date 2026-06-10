import {EntryModel} from "@/business/models";

export interface PresetStyleModel extends EntryModel {
    content: string;
    priority: number;
}


export const engineName = "style";
export const engineArrayName = "styles";
