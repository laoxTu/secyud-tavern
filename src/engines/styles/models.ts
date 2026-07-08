import {EntryModel} from "@/business/models";

export interface PresetStyleModel extends EntryModel {
    content: string;
    priority: number;
    type?: string;
}

export const engineName = "style";
export const enginePlural = "styles";
