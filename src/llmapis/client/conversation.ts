import {ConversationProvider} from "@/slots/client/conversation-models";
import {moduleName} from "../models";
import {engineName as regexEngineName} from "@/engines/regexes/models";
import {llmapiInputBuilderManager} from "@/llmapis/client/input-builder";


export const llmapiConversationProvider: ConversationProvider = {
    id: moduleName,
    requires: [regexEngineName],
    onInitialize: async () => {

    },
    onRenderStream: async () => {
    },
    onProcessInput: async (ctx) => {
        const provider: string = ctx.slot.llmapi.content.provider;
        ctx.messages = await llmapiInputBuilderManager.records[provider].onBuildInput(ctx);
    },
    onProcessOutput: async () => {
    },
    onRenderPage: async () => {
    }
};
