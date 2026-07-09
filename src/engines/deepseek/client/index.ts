import {config} from "./config"
import {llmapiConfigRegistry} from "@/modules/llmapis/client/config";

export function registerDeepseekClient() {
    llmapiConfigRegistry.register(config);
}