import {presetStorage} from "@/modules/presets/server/storage";
import {regexStorageProvider} from "./storage";


export function registerRegexesServer() {
    presetStorage.register(regexStorageProvider)
}