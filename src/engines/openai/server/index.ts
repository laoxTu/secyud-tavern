import {llmapiEngineRegistry} from "@/modules/llmapis/server/engine";
import {OpenAIEngine} from "@/engines/openai/server/engine";

export function registerOpenAIServer() {
    llmapiEngineRegistry.register(
        new OpenAIEngine()
    );
}