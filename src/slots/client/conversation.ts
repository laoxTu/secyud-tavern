'use client';
import {Registry} from "@/utils/register";
import {ConversationProvider} from "@/slots/client/conversation-models";

export class ConversationManager extends Registry<ConversationProvider> {
    constructor() {
        super("conversation");
    }
}

export const conversationManager = new ConversationManager();