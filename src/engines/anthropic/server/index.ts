import {llmapiProviderRegistry} from "@/modules/llmapis/server/provider";
import {anthropicProvider} from "./provider";

export function registerAnthropicServer() {
    llmapiProviderRegistry.register(
        anthropicProvider
    );
}