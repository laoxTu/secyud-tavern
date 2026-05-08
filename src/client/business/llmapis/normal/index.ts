import {LlmapiConfigRegistry} from "@/client/business/llmapis/normal/config";
import {config as deepseek} from "./config/deepseek";

export const llmapiConfigRegistry = new LlmapiConfigRegistry("llmapi config");

export function registerLlmapiConfig() {
    llmapiConfigRegistry
        .register(
            deepseek
        );
}
