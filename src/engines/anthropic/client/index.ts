import {provider} from "./provider"
import {llmapiProviderRegistry} from "@/modules/llmapis/client/provider";

export function registerAnthropicClient() {
    llmapiProviderRegistry.register(provider);
}