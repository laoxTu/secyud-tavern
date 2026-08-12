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


// 工具调用挂在对话三环节：初始化建缓存、输入下发工具、输出执行工具。
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
            // 工具未注册则报错中断，防止模型反复调用不存在的工具白耗 token。
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


// 在浏览器端执行模型请求的工具，结果写回 content。
// 会被两处调用，靠 content 已填去重，避免重复执行。
export async function fillToolCallContent(
    toolCalls: StoryOutputToolCall[],
    slot: SlotModel,
) {
    const cache = slot.content[enginePlural] as ToolConversationCache;
    for (const toolCall of toolCalls) {
        // 已执行过则跳过。
        if (toolCall.content) continue;
        try {
            console.debug(`use tool: ${toolCall.function.name}`)
            // 按函数名找配置，再经 toolId 找具体实现。
            const config = cache.tools[toolCall.function.name];
            const tool = llmapiToolManager.records[config.config.toolId];
            const args = JSON.parse(toolCall.function.arguments);
            const res = await tool.invoke(args, {slot});
            toolCall.content = JSON.stringify(res);
        } catch (err) {
            // 错误写回给模型调整，同时 console.error 供人工排查。
            toolCall.content = JSON.stringify({error: err, success: false});
            console.error(err);
        }
    }
}