import {conversationManager} from "@/slots/client/conversation";
import {ragConversationProvider} from "@/engines/rags/client/conversation";
import {settingTabManager} from "@/settings/client/tabs";
import {settingTab} from "./setting-tab";

export function registerRagsClient() {
    conversationManager.initializer.register(ragConversationProvider);
    conversationManager.outputProcesser.register(ragConversationProvider);
    conversationManager.inputProcesser.register(ragConversationProvider);
    settingTabManager.register(settingTab)
}