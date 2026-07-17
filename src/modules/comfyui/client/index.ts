import {businessNavigationManager} from "@/business/client/navigation";
import {comfyuiWorkflowNavigationContent} from "@/modules/comfyui/client/workflow-content";
import {comfyuiModelNavigationContent} from "@/modules/comfyui/client/model-content";
import {comfyuiWorkflowTabManager} from "@/modules/comfyui/client/workflow-tabs";
import {tabConfig as parameterTab} from "@/modules/comfyui/client/parameter-tab";

export function registerComfyUIClient() {
    businessNavigationManager.register(
        comfyuiWorkflowNavigationContent,
        comfyuiModelNavigationContent,
    );
    comfyuiWorkflowTabManager.register(
        parameterTab
    )
}