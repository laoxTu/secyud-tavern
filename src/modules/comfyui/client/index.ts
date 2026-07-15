import {businessNavigationManager} from "@/business/client/navigation";
import {comfyuiWorkflowNavigationContent} from "@/modules/comfyui/client/workflow-content";
import {comfyuiModelNavigationContent} from "@/modules/comfyui/client/model-content";

export function registerComfyUIClient() {
    businessNavigationManager.register(
        comfyuiWorkflowNavigationContent,
        comfyuiModelNavigationContent,
    );
}