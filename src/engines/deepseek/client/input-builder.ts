import {LlmapiInputBuilder} from "@/llmapis/client/input-builder-models";
import {LlmapiInputContext} from "@/slots/client/conversation-models";
import {engineName} from "@/engines/deepseek/models";
import {
    engineArrayName,
    engineArrayName as lorebookEngineArrayName,
    LorebookMessage, LorebookMessageItem,
    PresetLorebookModel
} from "@/engines/lorebooks/models";
import {LlmapiMessage} from "@/slots/models";
import {tryGetLastItem} from "@/utils";


export const deepseekInputBuilder: LlmapiInputBuilder = {
    id: engineName,
    onBuildInput: async (ctx: LlmapiInputContext) => {
        const messages = ctx.content.messages as LorebookMessage[];
        const fixedLorebooks = ctx.slot.content[lorebookEngineArrayName + "Fixed"] as PresetLorebookModel[];
        const lorebooks = ctx.slot.content[engineArrayName] as Record<string, PresetLorebookModel>;
        const firstMessage: LlmapiMessage = {
            role: "system",
            content: ""
        };
        ctx.messages.push(firstMessage);
        const visitedLorebooks = new Set<string>();
        const prepareLorebooks: PresetLorebookModel[] = [];
        for (const message of messages) {
            const userMessage: LlmapiMessage = {
                role: "user",
                content: ""
            }
            let userInput = "";
            for (const input of message.inputs) {
                userInput += input.message;
                fillLorebooks(input);
            }

            for (const lorebook of prepareLorebooks) {
                userMessage.content += lorebook.content;
            }
            userMessage.content += userInput;
            ctx.messages.push(userMessage);
            prepareLorebooks.length = 0;

            if (message.output) {
                const aiMessage: LlmapiMessage = {
                    role: "assistant",
                    content: message.output?.message
                }
                ctx.messages.push(aiMessage);
                fillLorebooks(message.output);
            }
        }
        const lastMessage = tryGetLastItem(ctx.messages)!;

        for (const lorebook of fixedLorebooks) {
            if (lorebook.layer < 50) {
                firstMessage.content += lorebook.content;
            } else {
                lastMessage.content += lorebook.content;
            }
        }

        return ctx.messages;

        function fillLorebooks(message: LorebookMessageItem) {
            if (!message.lorebooks) return;

            for (const lorebook of message.lorebooks) {
                if (!lorebooks[lorebook] ||
                    visitedLorebooks.has(lorebook)) continue;
                prepareLorebooks.push(lorebooks[lorebook]);
                visitedLorebooks.add(lorebook);
            }
        }
    }

}