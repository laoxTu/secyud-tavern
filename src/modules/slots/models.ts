import {SlotHistory} from "@/modules/models";
import {PresetModel} from "@/modules/presets/models";
import {JsonSchema} from "@/utils/json-schema";
import {LlmapiModel} from "@/modules/llmapis/models";
import {StoryModel} from "@/modules/stories/models";

export interface SlotModel extends StoryModel {
    llmapi: LlmapiModel,
    histories: SlotHistory[],
    presets: PresetModel[],
}

export interface LlmapiToolModel {
    name: string,
    description: string,
    parameters: JsonSchema
}


export const moduleName = 'slot';
export const moduleArrayName = 'slots';