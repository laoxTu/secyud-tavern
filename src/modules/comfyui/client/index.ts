import {businessNavigationManager} from "@/business/client/navigation";
import {comfyuiWorkflowNavigationContent} from "@/modules/comfyui/client/workflow-content";
import {comfyuiModelNavigationContent} from "@/modules/comfyui/client/model-content";
import {comfyuiWorkflowTabManager} from "@/modules/comfyui/client/workflow-tabs";
import {tabConfig as parameterTab} from "@/modules/comfyui/client/parameter-tab";
import {comfyuiFeature} from "@/modules/comfyui/client/slot-feature/comfyui-feature";
import {slotFeatureManager} from "@/modules/slots/client/feature";
import {settingTabManager} from "@/modules/settings/client/tabs";
import {settingTab} from "@/modules/comfyui/client/setting-tab";

export function registerComfyUIClient() {
    businessNavigationManager.register(
        comfyuiWorkflowNavigationContent,
        comfyuiModelNavigationContent,
    );
    comfyuiWorkflowTabManager.register(
        parameterTab
    );
    slotFeatureManager.register(
        comfyuiFeature
    );
    settingTabManager.register(
        settingTab
    );
}