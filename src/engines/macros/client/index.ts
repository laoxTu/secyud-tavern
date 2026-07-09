import {presetTabManager} from "@/modules/presets/client/tabs";
import {conversationManager} from "@/modules/slots/client/conversation";
import {tabConfig} from "./preset-tab";
import {macroConversationProvider, macroLlmapiInputProcesser} from "./conversation";


export function registerMacrosClient() {
    presetTabManager.register(tabConfig);
    conversationManager.initializer.register(macroConversationProvider);
    conversationManager.contentRenderer.register(macroConversationProvider);
    conversationManager.streamRenderer.register(macroConversationProvider);
    conversationManager.inputProcesser.register(macroLlmapiInputProcesser);
}