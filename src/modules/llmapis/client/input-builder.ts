import {LlmapiInputBuilder} from "./input-builder-models";
import {ClientRegistry} from "@/plugins/client";

export const llmapiInputBuilderManager = new ClientRegistry<LlmapiInputBuilder>('inputBuilderManager');