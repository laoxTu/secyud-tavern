import {llmapiProviderRegistry} from "@/modules/llmapis/server/provider";
import {OpenAIProvider} from "@/engines/openai/server/provider";

export function registerOpenAIServer() {
    llmapiProviderRegistry.register(
        new OpenAIProvider()
    );
}