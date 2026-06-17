import {config} from "./config"
import {llmapiConfigRegistry} from "@/llmapis/client/config";

export function registerOpenAIClient() {
    llmapiConfigRegistry.register(config);
}