import {LlmapiInputBuilder} from "@/llmapis/client/input-builder-models";
import {engineName} from "@/engines/deepseek/models";
import {defaultBuildInput} from "@/llmapis/client/input-builder-default";


export const deepseekInputBuilder: LlmapiInputBuilder = {
    id: engineName,
    onBuildInput: defaultBuildInput
}