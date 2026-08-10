import {presetStorage} from "@/modules/presets/server/storage";
import {toolStorageProvider} from "./storage";


export function registerToolsServer() {
    presetStorage.register(toolStorageProvider)
}