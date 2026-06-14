import {presetTabManager} from "@/presets/client/tabs";
import {conversationManager} from "@/slots/client/conversation";
import {tabConfig} from "./preset-tab";
import {regexConversationProvider, regexLlmapiInputProcesser} from "./conversation";


export function registerRegexesClient() {
    presetTabManager.register(tabConfig);
    conversationManager.initializer.register(regexConversationProvider);
    conversationManager.streamRenderer.register(regexConversationProvider);
    conversationManager.contentRenderer.register(regexConversationProvider);
    conversationManager.inputProcesser.register(regexLlmapiInputProcesser);
}