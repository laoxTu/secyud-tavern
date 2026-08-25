import {conversationManager} from "@/modules/stories/client/conversation";
import {memoriesConversationProvider} from "./conversation";
import {llmapiToolManager} from "@/engines/tools/client/manager";
import {memoryToolProvider} from "@/engines/memories/client/tool";

export function registerMemoriesClient() {
    conversationManager.initializer.register(
        memoriesConversationProvider
    );
    conversationManager.outputProcesser.register(
        memoriesConversationProvider
    );
    conversationManager.inputProcesser.register(
        memoriesConversationProvider
    );
    llmapiToolManager.register(
        memoryToolProvider,
    );
}