import {presetTabManager} from "@/presets/client/tabs";
import {conversationManager} from "@/slots/client/conversation";
import {tabConfig} from "./preset-tab";
import {lorebookConversationProvider} from "./conversation";

export function registerLorebooksClient() {
    presetTabManager.register(tabConfig);
    conversationManager.initializer.register(lorebookConversationProvider);
    conversationManager.inputProcesser.register(lorebookConversationProvider);
}