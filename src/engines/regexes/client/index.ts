import {presetTabManager} from "@/presets/client/tabs";
import {conversationManager} from "@/slots/client/conversation";
import {tabConfig} from "./preset-tab";
import {regexConversationProvider} from "./conversation";


export function registerRegexesClient() {
    presetTabManager.register(tabConfig);
    conversationManager.register(regexConversationProvider);
}