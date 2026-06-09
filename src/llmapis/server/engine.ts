import {Registry} from "@/utils/register";
import {LlmapiEngine} from "./engine-models";
import {moduleName} from "../models";

export class LlmEngineRegistry extends Registry<LlmapiEngine> {
}

export const llmapiEngineRegistry = new LlmEngineRegistry(moduleName,)
