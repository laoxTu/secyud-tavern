import {presetStorage} from "@/presets/server/storage";
import {scriptStorageProvider} from "./storage";


export function registerScriptsServer() {
    presetStorage.register(scriptStorageProvider)
}