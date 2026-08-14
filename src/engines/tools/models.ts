import {EntryModel} from "@/business/models";

export interface LlmapiToolConfigModel extends EntryModel {
    provider: string,
    value?: any,
}

export const engineName = "tool";
export const enginePlural = "tools";