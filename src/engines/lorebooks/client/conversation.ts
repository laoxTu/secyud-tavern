import {ConversationProvider, generateCurrentVariables, SlotContextBase} from "@/slots/client/conversation-models";
import {tryGetLastItem} from "@/utils";
import {StoryHistory, StoryHistoryMessage} from "@/stories/models";
import {engineName, engineArrayName, PresetLorebookModel, LorebookMessage} from "../models";
import {lorebookMatcherRegistry} from "./match";
import {matchName} from "../match/always/models";
import {MatcherMatchContext} from "@/engines/lorebooks/client/match-models";


function tryFillActiveLorebooks(ctx: SlotContextBase, history: StoryHistory, message: StoryHistoryMessage | null) {
    if (!message || message.activeLorebooks) {
        return;
    }

    const matchers = lorebookMatcherRegistry.records;

    const lorebooks: Record<string, PresetLorebookModel> = ctx.slot.content[engineArrayName];
    message.activeLorebooks = [];
    const variables = generateCurrentVariables(history, false);
    const context: MatcherMatchContext = {
        history, message, variables: variables,
    };

    for (const [key, lorebook] of Object.entries(lorebooks)) {
        const matcher = matchers[lorebook.matchType];
        if (matcher && matcher.match(context, lorebook.matchExpression)) {
            message.activeLorebooks.push(key);
        }
    }
}

function createLorebookContext(ctx: SlotContextBase, history: StoryHistory) {

    const histories = ctx.slot.story.histories!;
    const lorebooks: Record<string, PresetLorebookModel> = ctx.slot.content[engineArrayName];
    const lastInput = tryGetLastItem(history.inputs);
    const lastOutput = tryGetLastItem(history.outputs);

    tryFillActiveLorebooks(ctx, history, lastInput);
    tryFillActiveLorebooks(ctx, history, lastOutput);

    const messages: LorebookMessage[] = [];

    for (let i = histories.length - 1; i >= 0; i--) {
        const current = histories[i];
        const message: LorebookMessage = {
            inputs: []
        }

        if (current.outputs.length > current.outputId) {
            const output = current.outputs[current.outputId];
            message.output = {
                message: output.content,
                lorebooks: output.activeLorebooks
            }
        }

        for (const input of current.inputs) {
            message.inputs.push({
                message: input.content,
                lorebooks: input.activeLorebooks
            })
        }
        messages.push(message);
        if (current.isSummary) break;
    }


    // 历史信息直接转存到这里
    ctx.content.lorebooks = lorebooks;
    ctx.content.lastInput = lastInput;
    ctx.content.lastOutput = lastOutput;
    ctx.content.messages = messages.reverse();
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
