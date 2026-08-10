import {ClientRegistry} from "@/plugins/client";
import {LlmapiTool} from "@/engines/tools/client/models";
import {tabConfig} from "./llmapi-tab";
import {llmapiTabManager} from "@/modules/llmapis/client/tabs";
import {conversationManager} from "@/modules/slots/client/conversation";
import {toolConversationProvider} from "@/engines/tools/client/conversation";

export const llmapiToolManager = new ClientRegistry<LlmapiTool>("llmapiToolManager");

export function registerToolsClient() {
    llmapiTabManager.register(tabConfig);
    conversationManager.initializer.register(toolConversationProvider);
    conversationManager.outputProcesser.register(toolConversationProvider);
    conversationManager.inputProcesser.register(toolConversationProvider);
}