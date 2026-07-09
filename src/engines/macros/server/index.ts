import {presetStorage} from "@/modules/presets/server/storage";
import {macroStorageProvider} from "./storage";


export function registerMacrosServer() {
    presetStorage.register(macroStorageProvider)
}