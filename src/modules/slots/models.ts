import {SlotHistory} from "@/modules/models";
import {PresetModel} from "@/modules/presets/models";
import {JsonSchema} from "@/utils/json-schema";
import {LlmapiModel} from "@/modules/llmapis/models";
import {StoryModel} from "@/modules/stories/models";

export interface SlotModel extends StoryModel {
    initialized?: boolean;
    llmapi: LlmapiModel,
    histories: SlotHistory[],
    presets: PresetModel[],
    properties: Record<string, any>,
}

export interface LlmapiToolModel {
    name: string,
    description: string,
    parameters: JsonSchema
}


export const moduleName = 'slot';
export const moduleArrayName = 'slots';