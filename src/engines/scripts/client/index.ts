import {presetTabManager} from "@/presets/client/tabs";
import {conversationManager} from "@/slots/client/conversation";
import {tabConfig} from "./preset-tab";
import {scriptConversationProvider} from "./conversation";


export function registerScriptsClient() {
    presetTabManager.register(tabConfig)
    conversationManager.register(scriptConversationProvider)
}