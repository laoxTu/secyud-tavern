import {ConversationProvider} from "@/slots/client/conversation-models";
import {moduleName} from "../models";
import {engineName as regexEngineName} from "@/engines/regexes/models";
import {llmapiInputBuilderManager} from "@/llmapis/client/input-builder";
import {BusinessError} from "@/handler/models";


export const llmapiConversationProvider: ConversationProvider = {
    id: moduleName,
    requires: [regexEngineName],
    onInitialize: async () => {

    },
    onRenderStream: async () => {
    },
    onProcessInput: async (ctx) => {
        const provider: string | undefined = ctx.slot.llmapi.provider;
        if (!provider) {
            throw new BusinessError("No provider provided");
        }
        ctx.messages = await llmapiInputBuilderManager.records[provider].onBuildInput(ctx);
    },
    onProcessOutput: async () => {
    },
    onRenderPage: async () => {
    }
};
