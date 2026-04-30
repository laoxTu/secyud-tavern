import {registerPreset} from "@/server/business/presets";

export function registerBusiness() {
    registerPreset();
}

export {masterTable, entryTable} from "./entity-base";
export {ModelStorage} from "./model-storage";
export type {ModelStorageProvider} from "./model-storage";
export {createRepository} from "./repository-base";