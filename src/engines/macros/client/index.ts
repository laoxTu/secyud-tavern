import {presetTabManager} from "@/modules/presets/client/tabs";
import {conversationManager} from "@/modules/slots/client/conversation";
import {tabConfig} from "./preset-tab";
import {macroConversationProvider, macroLlmapiInputProcesser} from "./conversation";
import {slotFeatureManager} from "@/modules/slots/client/feature";
import {macroSelectorFeature} from "@/engines/macros/client/slot-feature";


export function registerMacrosClient() {
    presetTabManager.register(tabConfig);
    conversationManager.initializer.register(macroConversationProvider);
    conversationManager.contentRenderer.register(macroConversationProvider);
    conversationManager.streamRenderer.register(macroConversationProvider);
    conversationManager.inputProcesser.register(macroLlmapiInputProcesser);
    slotFeatureManager.register(
        macroSelectorFeature
    );
}