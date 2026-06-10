import {Registry} from "@/utils/register";
import {LlmapiInputBuilder} from "@/llmapis/client/input-builder-models";

export class LlmapiInputBuilderManager extends Registry<LlmapiInputBuilder> {
    constructor() {
        super("conversation");
    }
}

export const llmapiInputBuilderManager = new LlmapiInputBuilderManager();