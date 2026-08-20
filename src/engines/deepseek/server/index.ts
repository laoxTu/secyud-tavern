import {llmapiProviderRegistry} from "@/modules/llmapis/server/provider";
import {deepseekProvider} from "./provider";

export function registerDeepseekServer() {
    llmapiProviderRegistry.register(
        deepseekProvider
    );
}