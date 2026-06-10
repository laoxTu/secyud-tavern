import {config} from "./config"
import {llmapiConfigRegistry} from "@/llmapis/client/config";
import {llmapiInputBuilderManager} from "@/llmapis/client/input-builder";
import {deepseekInputBuilder} from "@/engines/deepseek/client/input-builder";

export function registerDeepseekClient() {
    llmapiConfigRegistry.register(config);
    llmapiInputBuilderManager.register(deepseekInputBuilder);
}