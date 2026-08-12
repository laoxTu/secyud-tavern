import {LlmapiProvider} from "./provider-models";
import {getInstance, ServerRegistry} from "@/plugins/server";

class LlmapiProviderRegistry extends ServerRegistry<LlmapiProvider> {
    static getInstance() {
        return getInstance("llmapi provider", (u) => new LlmapiProviderRegistry(u));
    }
}

export const llmapiProviderRegistry = LlmapiProviderRegistry.getInstance();
