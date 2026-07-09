import {presetTabManager} from "@/modules/presets/client/tabs";
import {conversationManager} from "@/modules/slots/client/conversation";
import {tabConfig} from "./preset-tab";
import {lorebookConversationProvider} from "./conversation";

export function registerLorebooksClient() {
    presetTabManager.register(tabConfig);
    conversationManager.initializer.register(lorebookConversationProvider);
    conversationManager.outputProcesser.register(lorebookConversationProvider);
    conversationManager.inputProcesser.register(lorebookConversationProvider);
}