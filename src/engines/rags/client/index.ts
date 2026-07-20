import {conversationManager} from "@/modules/slots/client/conversation";
import {ragConversationProvider} from "@/engines/rags/client/conversation";
import {settingTabManager} from "@/modules/settings/client/tabs";
import {settingTab} from "./setting-tab";
import {embeddingGeneratorManager} from "@/engines/rags/client/embedding";
import {transformersEmbeddingGenerator} from "@/engines/rags/embedding/transformers/client";

export function registerRagsClient() {
    conversationManager.initializer.register(
        ragConversationProvider
    );
    conversationManager.outputProcesser.register(
        ragConversationProvider
    );
    conversationManager.inputProcesser.register(
        ragConversationProvider
    );
    settingTabManager.register(
        settingTab
    );
    embeddingGeneratorManager.register(
        transformersEmbeddingGenerator
    );
}