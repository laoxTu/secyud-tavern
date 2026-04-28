// src/business/preset/index.ts
import {lorebookStorageProvider} from "./lorebook";
import {PresetModel} from "./models";
import {ModelStorage} from "@/models/storage";

const presetStorage = new ModelStorage<PresetModel>("preset",)

presetStorage.register(lorebookStorageProvider);

export {presetStorage} ;


