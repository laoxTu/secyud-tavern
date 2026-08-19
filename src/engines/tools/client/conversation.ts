import {SlotModel} from "@/modules/slots/models";
import {
    LlmapiInputProcesser,
    LlmapiOutputProcesser,
    SlotInitializer,
    slotUtils
} from "@/modules/slots/client/conversation-models";
import {engineName, enginePlural} from "@/engines/tools/models";
import {llmapiToolManager} from "@/engines/tools/client/manager";
import {LlmapiTool} from "@/engines/tools/client/models";
import {SlotCalling} from "@/modules/models/calling";
import {historyUtils} from "@/modules/models";

export interface ToolConversationCache {
    tools: Record<string, LlmapiTool>;
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
        for (const preset of ctx.slot.presets) {
            const entries = preset.entries?.[enginePlural];
            if (!entries) continue;
            for (const entry of entries) {
                if (entry.disabled || !entry.provider) continue;
                // 工具未注册则报错中断，防止模型反复调用不存在的工具白耗 token。
                const provider = llmapiToolManager.records[entry.provider];
                if (!provider) {
                    console.warn(`[tool]: provider missing(${entry.provider})`);
                    continue;
                }
                const tools = await provider.create(entry, ctx.slot);
                for (const tool of tools) {
                    cache.tools[tool.model.name] = tool;
                }
            }
        }
        slotUtils.setContent(ctx.slot, enginePlural, cache);
    },
    onProcessInput: async () => {
    },
    onProcessOutput: async (ctx) => {
        const outputs = historyUtils.getOutputs(ctx.history);
        if (!outputs?.length) return;
        for (const output of outputs) {
            await fillToolCallContent(ctx.slot, output.callings);
        }
    }
};


// 在浏览器端执行模型请求的工具，结果写回 content。
// 会被两处调用，靠 content 已填去重，避免重复执行。
export async function fillToolCallContent(
    slot: SlotModel,
    toolCalls?: SlotCalling[],
) {
    if (!toolCalls?.length) return;
    const cache: ToolConversationCache = slotUtils.getContent(slot, enginePlural);
    for (const toolCall of toolCalls) {
        // 已执行过则跳过。
        if (toolCall.result) continue;
        try {
            // 按函数名找配置，再经 toolId 找具体实现。
            const tool = cache.tools[toolCall.name];
            if (tool) {
                console.debug(`[tool]: `, tool.model.name);
                const args = JSON.parse(toolCall.arguments);
                toolCall.result = await tool.invoke(args);
            } else {
                toolCall.result = {
                    hidden: false,
                    content: "",
                };
            }
        } catch (err: any) {
            // 错误写回给模型调整，同时 console.error 供人工排查。
            toolCall.result = {
                hidden: false,
                content: `error: ${err?.message ?? "unknown error"}`,
            };
            console.error(err);
        }
    }
}