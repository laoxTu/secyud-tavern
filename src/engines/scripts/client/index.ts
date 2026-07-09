import {presetTabManager} from "@/modules/presets/client/tabs";
import {conversationManager} from "@/modules/slots/client/conversation";
import {tabConfig} from "./preset-tab";
import {scriptConversationProvider} from "./conversation";


export function registerScriptsClient() {
    presetTabManager.register(tabConfig)
    conversationManager.initializer.register(scriptConversationProvider)
    conversationManager.contentRenderer.register(scriptConversationProvider)
    conversationManager.streamRenderer.register(scriptConversationProvider)
}