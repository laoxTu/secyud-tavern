import {presetTabManager} from "@/modules/presets/client/tabs";
import {conversationManager} from "@/modules/slots/client/conversation";
import {tabConfig} from "./preset-tab";
import {lorebookConversationProvider} from "./conversation";
import {lorebookMatcherRegistry} from "../client/match";
import {alwaysMatcher} from "../match/always/client";
import {normalMatcher} from "../match/normal/client";
import {eventMatcher} from "../match/event/client";
import {vectorMatcher} from "../match/vector/client";
import {llmapiInputBuilderManager} from "@/modules/llmapis/client/input-builder";
import {llmapiLorebookInputBuilder} from "./input-builder";

export function registerLorebooksClient() {
    presetTabManager.register(tabConfig);
    conversationManager.initializer.register(lorebookConversationProvider);
    conversationManager.outputProcesser.register(lorebookConversationProvider);
    conversationManager.inputProcesser.register(lorebookConversationProvider);
    lorebookMatcherRegistry.register(
        alwaysMatcher,
        normalMatcher,
        eventMatcher,
        vectorMatcher
    );
    llmapiInputBuilderManager.register(
        llmapiLorebookInputBuilder
    );
}