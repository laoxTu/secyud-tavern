import {presetStorage} from "@/presets/server/storage";
import {lorebookStorageProvider} from "./storage";


export function registerLorebooksServer() {
    presetStorage.register(lorebookStorageProvider)
}