import {presetTabManager} from "@/presets/client/tabs";
import {conversationManager} from "@/slots/client/conversation";
import {tabConfig} from "./preset-tab";
import {macroConversationProvider} from "./conversation";


export function registerMacrosClient() {
    presetTabManager.register(tabConfig);
    conversationManager.register(macroConversationProvider);
}