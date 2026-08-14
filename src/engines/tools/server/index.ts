import {toolLlmapiStorageProvider, toolPresetStorageProvider} from "./storage";
import {llmapiStorage} from "@/modules/llmapis/server/storage";
import {presetStorage} from "@/modules/presets/server/storage";

export function registerToolsServer() {
    llmapiStorage.register(toolLlmapiStorageProvider);
    presetStorage.register(toolPresetStorageProvider);
}