import {tabConfig as llmapiTab} from "./llmapi-tab";
import {tabConfig as presetTab} from "./preset-tab";
import {toolConversationProvider} from "./conversation";
import {llmapiToolManager} from "./manager";
import {llmapiTabManager} from "@/modules/llmapis/client/tabs";
import {conversationManager} from "@/modules/slots/client/conversation";
import {variableToolProvider} from "@/engines/tools/variable/client";
import {urlFetchToolProvider} from "@/engines/tools/url-fetch/client";
import {scriptToolProvider} from "@/engines/tools/script/client";
import {presetTabManager} from "@/modules/presets/client/tabs";

export function registerToolsClient() {
    llmapiTabManager.register(llmapiTab);
    presetTabManager.register(presetTab);
    llmapiToolManager.register(
        urlFetchToolProvider,
        variableToolProvider,
        scriptToolProvider,
    );
    conversationManager.initializer.register(toolConversationProvider);
    conversationManager.outputProcesser.register(toolConversationProvider);
    conversationManager.inputProcesser.register(toolConversationProvider);
}