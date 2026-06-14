import {config} from "./config"
import {llmapiConfigRegistry} from "@/llmapis/client/config";

export function registerDeepseekClient() {
    llmapiConfigRegistry.register(config);
}