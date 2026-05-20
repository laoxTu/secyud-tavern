import {styleConversationProvider} from "./styles/provider";
import {ConversationProviderManager} from "./conversation";


export const conversationProviderManager = new ConversationProviderManager("conversation");


export function registerSlot() {

    conversationProviderManager.register(
        styleConversationProvider,
    );
}

