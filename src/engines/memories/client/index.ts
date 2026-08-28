import {conversationManager} from "@/modules/stories/client/conversation";
import {memoriesConversationProvider} from "./conversation";
import {llmapiToolManager} from "@/engines/tools/client/manager";
import {memoryToolProvider} from "@/engines/memories/client/tool";
import {storyTabManager} from "@/modules/stories/client/tabs";
import {tabConfig} from "@/engines/memories/client/story-tab";

export function registerMemoriesClient() {
    storyTabManager.register(tabConfig);
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