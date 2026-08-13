import {ClientRegistry} from "@/plugins/client";
import {LlmapiTool} from "@/engines/tools/client/models";
import {tabConfig} from "./llmapi-tab";
import {llmapiTabManager} from "@/modules/llmapis/client/tabs";
import {conversationManager} from "@/modules/slots/client/conversation";
import {toolConversationProvider} from "@/engines/tools/client/conversation";
import {variableGetTool, variableSetTool} from "@/engines/tools/variable/client";
import {webSearchTool} from "@/engines/tools/web-search/client";

export const llmapiToolManager = new ClientRegistry<LlmapiTool>("llmapiToolManager");

export function registerToolsClient() {
    llmapiTabManager.register(tabConfig);
    llmapiToolManager.register(
        variableSetTool,
        variableGetTool,
        webSearchTool,
    );
    conversationManager.initializer.register(toolConversationProvider);
    conversationManager.outputProcesser.register(toolConversationProvider);
    conversationManager.inputProcesser.register(toolConversationProvider);
}