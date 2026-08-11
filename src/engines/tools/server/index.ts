import {toolStorageProvider} from "./storage";
import {llmapiStorage} from "@/modules/llmapis/server/storage";


export function registerToolsServer() {
    llmapiStorage.register(toolStorageProvider);
}