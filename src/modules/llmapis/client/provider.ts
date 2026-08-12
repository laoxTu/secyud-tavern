import {ClientRegistry} from "@/plugins/client";
import {LlmapiProvider} from "./provider-models";

export const llmapiProviderRegistry = new ClientRegistry<LlmapiProvider>("llmapiConfig");