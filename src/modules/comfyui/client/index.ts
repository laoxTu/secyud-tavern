import {businessNavigationManager} from "@/business/client/navigation";
import {comfyuiWorkflowNavigationContent} from "./workflow-content";
import {comfyuiModelNavigationContent} from "./model-content";
import {comfyuiWorkflowTabManager} from "./workflow-tabs";
import {tabConfig as parameterTab} from "./parameter-tab";
import {comfyuiFeature} from "./slot-feature/comfyui-feature";
import {slotFeatureManager} from "@/modules/slots/client/feature";
import {settingTabManager} from "@/modules/settings/client/tabs";
import {settingTab} from "./setting-tab";
import {comfyUIParameterRegistry} from "./parameter";
import {modelSelector} from "../parameters/model-selector/client";
import {powerLoraSelector} from "../parameters/power-lora-selector/client";
import {textEditor} from "../parameters/text-editor/client";
import {numberEditor} from "../parameters/number-editor/client";
import {llmTextEditor} from "../parameters/llm-text-editor/client";
import {imageCallback} from "../parameters/image-callback/client";
import {selector} from "@/modules/comfyui/parameters/selector/client";

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
    comfyUIParameterRegistry.register(
        modelSelector,
        powerLoraSelector,
        textEditor,
        numberEditor,
        llmTextEditor,
        imageCallback,
        selector,
    );
}