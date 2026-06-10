import {LlmapiInputBuilder} from "@/llmapis/client/input-builder-models";
import {LlmapiInputContext} from "@/slots/client/conversation-models";
import {engineName} from "@/engines/deepseek/models";
import {
    engineArrayName,
    engineArrayName as lorebookEngineArrayName,
    LorebookMessage,
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
        const nextLorebooks: PresetLorebookModel[] = [];
        for (const message of messages) {
            const userMessage: LlmapiMessage = {
                role: "user",
                content: ""
            }
            let userInput = "";
            for (const input of message.inputs) {
                userInput += input.message;
                if (input.lorebooks) {
                    for (const lorebook of input.lorebooks) {
                        if (lorebooks[lorebook]) {
                            nextLorebooks.push(lorebooks[lorebook]);
                        }
                    }
                }
            }

            for (const lorebook of nextLorebooks) {
                userMessage.content += lorebook.content;
            }
            userMessage.content += userInput;
            ctx.messages.push(userMessage);
            nextLorebooks.length = 0;

            if (message.output) {
                const aiMessage: LlmapiMessage = {
                    role: "assistant",
                    content: message.output?.message
                }
                ctx.messages.push(aiMessage);
                if (message.output.lorebooks) {
                    for (const lorebook of message.output.lorebooks) {
                        if (lorebooks[lorebook]) {
                            nextLorebooks.push(lorebooks[lorebook]);
                        }
                    }
                }
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
    }

}