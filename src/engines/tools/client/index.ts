import {tabConfig} from "./llmapi-tab";
import {llmapiTabManager} from "@/modules/llmapis/client/tabs";
import {conversationManager} from "@/modules/slots/client/conversation";
import {toolConversationProvider} from "@/engines/tools/client/conversation";
import {variableToolProvider} from "@/engines/tools/variable/client";
import {urlFetchToolProvider} from "@/engines/tools/url-fetch/client";
import {llmapiToolManager} from "@/engines/tools/client/manager";

export function registerToolsClient() {
    llmapiTabManager.register(tabConfig);
    llmapiToolManager.register(
        urlFetchToolProvider,
        variableToolProvider,
    );
    conversationManager.initializer.register(toolConversationProvider);
    conversationManager.outputProcesser.register(toolConversationProvider);
    conversationManager.inputProcesser.register(toolConversationProvider);
}