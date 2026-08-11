import {getCurrentOutput, LlmapiToolModel, SlotModel} from "@/modules/slots/models";
import {
    LlmapiInputProcesser,
    LlmapiOutputProcesser,
    SlotInitializer
} from "@/modules/slots/client/conversation-models";
import {engineName, enginePlural, LlmapiToolConfigModel} from "@/engines/tools/models";
import {llmapiToolManager} from "@/engines/tools/client/index";
import {StoryOutputToolCall} from "@/modules/stories/models";

export interface ToolConversationCache {
    tools: Record<string, { tool: LlmapiToolModel, config: LlmapiToolConfigModel }>;
}


export const toolConversationProvider:
    SlotInitializer
    & LlmapiInputProcesser
    & LlmapiOutputProcesser
    = {
    id: engineName,
    onInitialize: async (ctx) => {
        const cache: ToolConversationCache = {
            tools: {},
        };
        const entries = ctx.slot.llmapi.entries
            ?.[enginePlural] as LlmapiToolConfigModel[];
        for (const entry of entries) {
            if (entry.disabled || !entry.toolId) continue;
            const tool = llmapiToolManager.records[entry.toolId];
            const model = tool.model(entry);
            cache.tools[model.function.name] = {
                config: entry,
                tool: model
            };
        }
        ctx.slot.content[enginePlural] = cache;
    },
    onProcessInput: async (ctx) => {
        const cache = ctx.slot.content[enginePlural] as ToolConversationCache;
        const tools = Object
            .values(cache.tools).map(u => u.tool);
        ctx.tools = tools.length > 0 ? tools : undefined;
    },
    onProcessOutput: async (ctx) => {
        const output = getCurrentOutput(ctx.history);
        if (output?.toolCalls) {
            await fillToolCallContent(output.toolCalls, ctx.slot);
        }
    }
};


export async function fillToolCallContent(
    toolCalls: StoryOutputToolCall[],
    slot: SlotModel,
) {
    const cache = slot.content[enginePlural] as ToolConversationCache;
    for (const toolCall of toolCalls) {
        if (toolCall.content) continue;
        try {
            console.debug(`use tool: ${toolCall.function.name}`)
            const config = cache.tools[toolCall.function.name];
            const tool = llmapiToolManager.records[config.config.toolId];
            const args = JSON.parse(toolCall.function.arguments);
            const res = await tool.invoke(args, {slot});
            toolCall.content = JSON.stringify(res);
        } catch (err) {
            toolCall.content = JSON.stringify({error: err, success: false});
        }
    }
}