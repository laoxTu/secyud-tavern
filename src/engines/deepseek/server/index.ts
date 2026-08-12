import {llmapiProviderRegistry} from "@/modules/llmapis/server/provider";
import {DeepseekProvider} from "@/engines/deepseek/server/provider";

export function registerDeepseekServer() {
    llmapiProviderRegistry.register(
        new DeepseekProvider()
    );
}