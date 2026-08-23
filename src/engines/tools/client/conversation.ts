import {SlotModel} from "@/modules/stories/models";
import {
    LlmapiInputProcesser,
    LlmapiOutputProcesser,
    SlotInitializer,
    slotUtils
} from "@/modules/stories/client/conversation-models";
import {engineName, enginePlural, LlmapiToolConfigModel} from "@/engines/tools/models";
import {llmapiToolManager} from "@/engines/tools/client/manager";
import {LlmapiTool} from "@/engines/tools/client/models";
import {SlotCalling} from "@/modules/models/calling";
import {historyUtils} from "@/modules/models";
import {BusinessError} from "@/handler/models";
import {useStoryChatboxState} from "@/modules/stories/client/history-chatbox";

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
            const entries: LlmapiToolConfigModel[] = preset.entries?.[enginePlural];
            if (!entries) continue;
            for (const entry of entries) {
                if (entry.disabled || !entry.provider) continue;
                // 工具未注册则报错中断，防止模型反复调用不存在的工具白耗 token。
                const provider = llmapiToolManager.records[entry.provider];
                if (!provider) {
                    console.warn(`[tool]: provider missing(${entry.provider})`);
                    continue;
                }
                try {
                    const tools = await provider.create(entry, ctx.slot);
                    for (const tool of tools) {
                        cache.tools[tool.model.name] = tool;
                    }
                } catch (error) {
                    throw new BusinessError("tool create failed", "tool.create_failed")
                        .withValue("entry", entry.code);
                }
            }
        }
        slotUtils.setProperty(ctx.slot, enginePlural, cache);
    },
    onProcessInput: async () => {
    },
    onProcessOutput: async (ctx) => {
        const outputs = historyUtils.getOutputs(ctx.history);
        if (!outputs?.length) return;
        for (const output of outputs) {
            await callTools(ctx.slot, output.callings);
        }
    }
};

function getActiveTools(slot: SlotModel) {
    const cache = slotUtils.getProperty<ToolConversationCache>(slot, enginePlural);

    return Object.values(cache.tools).filter(t => !t.disabled);
}

// 在浏览器端执行模型请求的工具，结果写回 content。
// 会被两处调用，靠 content 已填去重，避免重复执行。
async function callTools(
    slot: SlotModel,
    toolCalls?: SlotCalling[],
) {
    if (!toolCalls?.length) return;
    const cache: ToolConversationCache = slotUtils.getProperty(slot, enginePlural);

    let aborted = false;
    useStoryChatboxState.getState()
        .setAbort(() => aborted = true);
    for (const toolCall of toolCalls.filter(u => !u.result)) {
        if (aborted) break;
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

export const toolUtils = {
    callTools, getActiveTools
}