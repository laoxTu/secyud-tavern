import {businessNavigationManager} from "@/business/client/navigation";
import {llmapiNavigationContent} from "./content";
import {conversationManager} from "@/slots/client/conversation";
import {llmapiConversationProvider} from "@/llmapis/client/conversation";
import {def} from "@/plugins/client/api";
import * as inputBuilder from './input-builder'
import * as config from './config'

def('@/llmapis/client/input-builder', inputBuilder);
def('@/llmapis/client/config', config);

export function registerLlmapiClient() {
    businessNavigationManager.register(
        llmapiNavigationContent);
    conversationManager.inputProcesser.register(
        llmapiConversationProvider)
}