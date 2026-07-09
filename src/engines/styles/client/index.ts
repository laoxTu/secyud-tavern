import {presetTabManager} from "@/modules/presets/client/tabs";
import {conversationManager} from "@/modules/slots/client/conversation";
import {tabConfig} from "./preset-tab";
import {styleConversationProvider} from "./conversation";


export function registerStylesClient() {
    presetTabManager.register(tabConfig)
    conversationManager.initializer.register(styleConversationProvider)
    conversationManager.contentRenderer.register(styleConversationProvider)
}