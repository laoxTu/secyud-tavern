import {presetTabManager} from "@/presets/client/tabs";
import {conversationManager} from "@/slots/client/conversation";
import {tabConfig} from "./preset-tab";
import {scriptConversationProvider} from "./conversation";


export function registerScriptsClient() {
    presetTabManager.register(tabConfig)
    conversationManager.initializer.register(scriptConversationProvider)
    conversationManager.contentRenderer.register(scriptConversationProvider)
    conversationManager.streamRenderer.register(scriptConversationProvider)
}