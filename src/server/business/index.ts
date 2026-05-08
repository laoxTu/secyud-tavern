import {registerPreset} from "@/server/business/presets";
import {registerLlmapi} from "@/server/business/llmapis";
import {registerStory} from "@/server/business/stories";

export function registerBusiness() {
    registerPreset();
    registerStory();
    registerLlmapi();
}

export {masterTable, entryTable} from "./entity-base";
export {ModelStorage} from "./model-storage";
export type {ModelStorageProvider} from "./model-storage";
export {createRepository} from "./repository-base";