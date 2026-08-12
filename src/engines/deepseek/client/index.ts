import {provider} from "./provider"
import {llmapiProviderRegistry} from "@/modules/llmapis/client/provider";

export function registerDeepseekClient() {
    llmapiProviderRegistry.register(provider);
}