import {presetTabManager} from "@/presets/client/tabs";
import {conversationManager} from "@/slots/client/conversation";
import {tabConfig} from "./preset-tab";
import {styleConversationProvider} from "./conversation";


export function registerStylesClient() {
    presetTabManager.register(tabConfig)
    conversationManager.initializer.register(styleConversationProvider)
    conversationManager.contentRenderer.register(styleConversationProvider)
}