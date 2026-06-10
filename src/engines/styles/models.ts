import {EntryModel} from "@/business/models";

export interface PresetStyleModel extends EntryModel {
    name: string;
    content: string;
    priority: number;
}


export const engineName = "style";
export const engineArrayName = "styles";
