import {presetTabManager} from "@/presets/client/tabs";
import {conversationManager} from "@/slots/client/conversation";
import {tabConfig} from "./preset-tab";
import {lorebookConversationProvider} from "./conversation";
import {def} from "@/plugins/client/api";
import * as match from "./match";

def('@/engines/lorebooks/client/match', match);
export function registerLorebooksClient() {
    presetTabManager.register(tabConfig);
    conversationManager.initializer.register(lorebookConversationProvider);
    conversationManager.inputProcesser.register(lorebookConversationProvider);
}