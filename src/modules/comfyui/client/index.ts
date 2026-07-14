import {businessNavigationManager} from "@/business/client/navigation";
import {comfyuiWorkflowNavigationContent} from "@/modules/comfyui/client/workflow-content";

export function registerComfyUIClient() {
    businessNavigationManager.register(
        comfyuiWorkflowNavigationContent);
}