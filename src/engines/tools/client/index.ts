import {tabConfig} from "./preset-tab";
import {toolConversationProvider} from "./conversation";
import {llmapiToolManager} from "./manager";
import {conversationManager} from "@/modules/stories/client/conversation";
import {variableToolProvider} from "@/engines/tools/variable/client";
import {urlFetchToolProvider} from "@/engines/tools/url-fetch/client";
import {scriptToolProvider} from "@/engines/tools/script/client";
import {presetTabManager} from "@/modules/presets/client/tabs";
import {subAgentToolProvider} from "@/engines/tools/sub-agent/client";
import {slotFeatureManager} from "@/modules/stories/client/feature";
import {toolSelectorFeature} from "@/engines/tools/client/slot-feature";

export function registerToolsClient() {
    presetTabManager.register(tabConfig);
    llmapiToolManager.register(
        urlFetchToolProvider,
        variableToolProvider,
        scriptToolProvider,
        subAgentToolProvider,
    );
    conversationManager.initializer.register(toolConversationProvider);
    conversationManager.outputProcesser.register(toolConversationProvider);
    conversationManager.inputProcesser.register(toolConversationProvider);slotFeatureManager.register(
        toolSelectorFeature
    );
}