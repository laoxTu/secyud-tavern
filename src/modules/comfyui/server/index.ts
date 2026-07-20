
import {comfyuiWorkflowStorage} from "./storage";
import {parameterStorageProvider} from "@/modules/comfyui/server/parameter-storage";
import {comfyUIModelImporterRegistry} from "@/modules/comfyui/server/impoter";
import {civitaiModelImporter} from "@/modules/comfyui/importers/civitai/server";


export function registerComfyUIServer() {
    comfyuiWorkflowStorage.register(parameterStorageProvider);
    comfyUIModelImporterRegistry.register(civitaiModelImporter)
}