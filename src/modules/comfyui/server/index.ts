
import {comfyuiWorkflowStorage} from "./storage";
import {parameterStorageProvider} from "@/modules/comfyui/server/parameter-storage";


export function registerComfyUIServer() {
    comfyuiWorkflowStorage.register(parameterStorageProvider)
}