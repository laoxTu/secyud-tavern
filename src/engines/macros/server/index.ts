import {presetStorage} from "@/presets/server/storage";
import {macroStorageProvider} from "./storage";


export function registerMacrosServer() {
    presetStorage.register(macroStorageProvider)
}