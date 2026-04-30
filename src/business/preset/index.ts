// src/business/preset/index.ts
import {lorebookStorageProvider} from "./lorebook";
import {PresetModel} from "./models";
import {ModelStorage} from "@/models/storage";
import {regexStorageProvider} from "@/business/preset/regex";
import {styleStorageProvider} from "@/business/preset/style";
import {scriptStorageProvider} from "@/business/preset/script";

const presetStorage = new ModelStorage<PresetModel>("preset",)

presetStorage.register(lorebookStorageProvider);
presetStorage.register(regexStorageProvider);
presetStorage.register(styleStorageProvider);
presetStorage.register(scriptStorageProvider);

export {presetStorage} ;


