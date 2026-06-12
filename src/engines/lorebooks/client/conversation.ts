import {ConversationProvider, SlotContextBase} from "@/slots/client/conversation-models";
import {tryGetLastItem} from "@/utils";
import {
    getCurrentOutput,
    StoryHistory
} from "@/stories/models";
import {engineName, engineArrayName, PresetLorebookModel, LorebookMessage} from "../models";
import {matchName} from "../match/always/models";
import {generateCurrentVariables, getOpeningHistory} from "@/slots/client/conversation";
import {tryFillActiveLorebooks} from "@/engines/lorebooks/client/match";


function createLorebookContext(ctx: SlotContextBase, history: StoryHistory) {

    const histories = ctx.slot.story.histories!;
    const lorebooks: Record<string, PresetLorebookModel> = ctx.slot.content[engineArrayName];
    const lastInput = tryGetLastItem(history.inputs);
    const lastOutput = tryGetLastItem(history.outputs);

    const messages: LorebookMessage[] = [];
    const start = histories.findLastIndex(u => u.summary);
    // 没有摘要时取开场白
    if (start === -1) {
        const openingHistory = getOpeningHistory(ctx.slot);
        const message = openingHistory.inputs[0];
        messages.push({
            inputs: [{
                message: message.content,
                lorebooks: message.activeLorebooks
            }]
        });
    }
    // 正常解析信息
    for (let i = Math.max(0, start); i < histories.length; i++) {
        const current = histories[i];
        const message: LorebookMessage = {
            inputs: []
        }

        for (const input of current.inputs) {
            if (!input.activeLorebooks) {
                const variables = generateCurrentVariables(current, false);
                tryFillActiveLorebooks(lorebooks, {variables, history: current, message: input});
            }
            message.inputs.push({
                message: input.content,
                lorebooks: input.activeLorebooks
            })
        }

        const output = getCurrentOutput(current);
        if (output && current !== history) {
            if (!output.activeLorebooks) {
                const variables = generateCurrentVariables(current, true);
                tryFillActiveLorebooks(lorebooks, {variables, history: current, message: output});
            }
            message.output = {
                message: output.content,
                lorebooks: output.activeLorebooks
            }
        }

        messages.push(message);
    }
    console.debug("messages");
    console.debug(messages)

    // 历史信息直接转存到这里
    ctx.content.lorebooks = lorebooks;
    ctx.content.lastInput = lastInput;
    ctx.content.lastOutput = lastOutput;
    ctx.content.messages = messages;
}

export const lorebookConversationProvider: ConversationProvider = {
    id: engineName,
    onInitialize: async (ctx) => {
        const lorebooks: Record<string, PresetLorebookModel> = {};
        const lorebooksS: PresetLorebookModel[] = [];
        const lorebooksE: PresetLorebookModel[] = [];
        for (const preset of ctx.slot.presets) {
            const entryLorebooks = preset.entries
                ?.[engineArrayName] as PresetLorebookModel[];
            if (!entryLorebooks) continue;
            for (const lorebook of entryLorebooks) {
                if (lorebook.disabled) continue;
                if (lorebook.matchType === matchName) {
                    if (lorebook.matchExpression?.lastMessage)
                        lorebooksE.push(lorebook);
                    else lorebooksS.push(lorebook);
                } else {
                    lorebooks[`${preset.code}-${lorebook.code}`] = lorebook;
                }
            }
        }
        ctx.slot.content[engineArrayName] = lorebooks;
        ctx.slot.content[engineArrayName + "S"] = lorebooksS;
        ctx.slot.content[engineArrayName + "E"] = lorebooksE;
    },
    onRenderStream: async () => {

    },
    onProcessInput: async (ctx) => {
        createLorebookContext(ctx, ctx.history);
    },
    onProcessOutput: async (ctx) => {
        createLorebookContext(ctx, ctx.history);
    },
    onRenderPage: async () => {
    }
};
