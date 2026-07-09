import {ClientRegistry} from "@/plugins/client";
import {LlmapiConfig} from "./config-models";

export class LlmapiConfigRegistry extends ClientRegistry<LlmapiConfig> {
}

export const llmapiConfigRegistry = new LlmapiConfigRegistry("llmapi config");