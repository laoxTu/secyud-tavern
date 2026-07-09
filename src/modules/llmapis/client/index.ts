import {businessNavigationManager} from "@/business/client/navigation";
import {llmapiNavigationContent} from "./content";
import {conversationManager} from "@/modules/slots/client/conversation";
import {llmapiConversationProvider} from "@/modules/llmapis/client/conversation";


export function registerLlmapiClient() {
    businessNavigationManager.register(
        llmapiNavigationContent);
    conversationManager.inputProcesser.register(
        llmapiConversationProvider)
}