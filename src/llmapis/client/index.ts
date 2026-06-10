import {businessNavigationManager} from "@/business/client/navigation";
import {llmapiNavigationContent} from "./content";
import {conversationManager} from "@/slots/client/conversation";
import {llmapiConversationProvider} from "@/llmapis/client/conversation";


export function registerLlmapiClient() {
    businessNavigationManager.register(
        llmapiNavigationContent);
    conversationManager.register(
        llmapiConversationProvider)
}