import {toolStorageProvider} from "./storage";
import {presetStorage} from "@/modules/presets/server/storage";

export function registerToolsServer() {
    presetStorage.register(toolStorageProvider);
}