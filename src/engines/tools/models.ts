import {EntryModel} from "@/business/models";

export interface LlmapiToolConfigModel extends EntryModel {
    toolId: string,
    value?: any,
}

export const engineName = "tool";
export const enginePlural = "tools";