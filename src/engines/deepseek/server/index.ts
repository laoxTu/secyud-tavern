import {llmapiEngineRegistry} from "@/llmapis/server/engine";
import {DeepseekEngine} from "@/engines/deepseek/server/engine";

export function registerDeepseekServer() {
    llmapiEngineRegistry.register(
        new DeepseekEngine()
    );
}