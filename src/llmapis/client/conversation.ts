import {moduleName} from "../models";
import {engineName as lorebookEngineName} from "@/engines/lorebooks/models";
import {llmapiInputBuilderManager} from "@/llmapis/client/input-builder";
import {BusinessError} from "@/handler/models";
import {LlmapiInputProcesser} from "@/slots/client/conversation-models";


export const llmapiConversationProvider: LlmapiInputProcesser = {
    id: moduleName,
    requires: [lorebookEngineName],
    onProcessInput: async (ctx) => {
        const provider: string | undefined = ctx.slot.llmapi.builder;
        if (!provider) {
            throw new BusinessError("No provider provided");
        }
        ctx.messages = await llmapiInputBuilderManager.records[provider]
            .onBuildInput(ctx, ctx.slot.llmapi.content["builder"]);
    },
};
