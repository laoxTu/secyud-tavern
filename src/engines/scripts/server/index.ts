import {presetStorage} from "@/modules/presets/server/storage";
import {scriptStorageProvider} from "./storage";


export function registerScriptsServer() {
    presetStorage.register(scriptStorageProvider)
}