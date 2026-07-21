import {ClientRegistry} from "@/plugins/client";
import {LlmapiConfig} from "./config-models";

export const llmapiConfigRegistry = new ClientRegistry<LlmapiConfig>("llmapiConfig");