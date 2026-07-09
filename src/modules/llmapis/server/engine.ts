import {LlmapiEngine} from "./engine-models";
import {getInstance, ServerRegistry} from "@/plugins/server";

class LlmEngineRegistry extends ServerRegistry<LlmapiEngine> {


    static getInstance() {
        return getInstance("llmEngine", (u) => new LlmEngineRegistry(u));
    }
}

export const llmapiEngineRegistry = LlmEngineRegistry.getInstance();
