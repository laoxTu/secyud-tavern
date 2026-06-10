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
    let activeLorebooks = ctx.content.activeLorebooks as Set<string>;
    if (!activeLorebooks) {
        activeLorebooks = new Set<string>();
        const histories = ctx.slot.story.histories!;
        for (let i = histories.length - 1; i >= 0; i--) {
            const current = histories[i];

            if (current.outputs.length > current.outputId) {
                const output = current.outputs[current.outputId];
                if (output.activeLorebooks) {
                    for (const lorebook of output.activeLorebooks) {
                        activeLorebooks.add(lorebook);
                    }
                }
            }

            for (const input of current.inputs) {
                if (input.activeLorebooks) {
                    for (const lorebook of input.activeLorebooks) {
                        activeLorebooks.add(lorebook);
                    }
                }
            }
            if (current.isSummary) break;
        }
        ctx.content.activeLorebooks = activeLorebooks;
    }

    const lorebooks: Record<string, PresetLorebookModel> = ctx.slot.content[engineArrayName];
    message.activeLorebooks = [];
    const variables = generateCurrentVariables(history, false);
    const context: MatcherMatchContext = {
        history, message, variables: variables,
    };
    for (const [key, lorebook] of Object.entries(lorebooks)) {
        if (activeLorebooks.has(key)) continue;
        const matcher = matchers[lorebook.matchType];
        if (matcher && matcher.match(context, lorebook.matchExpression)) {
            message.activeLorebooks.push(key);
            activeLorebooks.add(key);
        }
    }
}

function createLorebookContext(ctx: SlotContextBase, history: StoryHistory) {

    const histories = ctx.slot.story.histories!;
    const lorebooks: Record<string, PresetLorebookModel> = ctx.slot.content[engineArrayName];
    const fixedLorebooks: PresetLorebookModel[] = ctx.slot.content[engineArrayName + "Fixed"];
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
    ctx.content.fixedLorebooks = fixedLorebooks;
    ctx.content.lastInput = lastInput;
    ctx.content.lastOutput = lastOutput;
    ctx.content.messages = messages.reverse();
}


export const lorebookConversationProvider: ConversationProvider = {
    id: engineName,
    onInitialize: async (ctx) => {
        const lorebooks: Record<string, PresetLorebookModel> = {};
        const fixedLorebooks: PresetLorebookModel[] = [];
        for (const preset of ctx.slot.presets) {
            const entryLorebooks = preset.entries?.[engineArrayName];
            if (!entryLorebooks) continue;
            for (const lorebook of entryLorebooks) {
                if (lorebook.disabled) continue;
                if (lorebook.matchType === matchName) {
                    fixedLorebooks.push(lorebook);
                    continue;
                }
                const key = `${preset.code}-${lorebook.code}`
                lorebooks[key] = lorebook;
            }
        }
        fixedLorebooks.sort((a, b) => a.priority - b.priority)
        fixedLorebooks.sort((a, b) => a.layer - b.layer)
        ctx.slot.content[engineArrayName] = lorebooks;
        ctx.slot.content[engineArrayName + "Fixed"] = fixedLorebooks;
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
