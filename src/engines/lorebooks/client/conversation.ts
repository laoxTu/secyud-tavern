import {
    engineName,
    engineArrayName,
    PresetLorebookModel,
    compareLorebook,
} from "../models";
import {matchName} from "../match/always/models";
import {generateCurrentVariables} from "@/slots/client/conversation";
import {tryFillActiveLorebooks} from "@/engines/lorebooks/client/match";
import {
    LlmapiHistory,
    LlmapiInputProcesser,
    LlmapiOutputProcesser,
    SlotInitializer
} from "@/slots/client/conversation-models";
import {getCurrentOutput, StoryHistoryMessage} from "@/stories/models";


export interface LorebookConversationCache {
    before: PresetLorebookModel[],
    after: PresetLorebookModel[]
    entries: Record<string, PresetLorebookModel>
}

export const lorebookConversationProvider:
    SlotInitializer
    & LlmapiInputProcesser
    & LlmapiOutputProcesser
    = {
    id: engineName,
    onInitialize: async (ctx) => {
        const cache: LorebookConversationCache = {
            before: [],
            after: [],
            entries: {}
        };
        for (const preset of ctx.slot.presets) {
            const entries = preset.entries
                ?.[engineArrayName] as PresetLorebookModel[];
            if (!entries) continue;
            for (const entry of entries) {
                if (entry.disabled) continue;
                const id = `${preset.code}-${entry.code}`;
                // 替换code，唯一标识
                entry.code = id;
                if (entry.matchType === matchName) {
                    if (entry.matchExpression?.lastMessage)
                        cache.after.push(entry);
                    else cache.before.push(entry);
                } else {
                    cache.entries[id] = entry;
                }
            }
        }
        ctx.slot.content[engineArrayName] = cache;
    },
    onProcessInput: async (ctx) => {
        const cache: LorebookConversationCache = ctx.slot.content[engineArrayName];

        const prepareLorebooks: PresetLorebookModel[] = [];
        // 将世界书拷贝到上下文中，用于生成提示词。
        for (const history of ctx.histories) {
            for (const input of history.inputs) {
                setActiveLorebooks(history, input, false);
            }

            history.properties["lorebooks"] = [...prepareLorebooks].sort(compareLorebook);
            prepareLorebooks.length = 0;

            const output = getCurrentOutput(history);
            if (output) {
                setActiveLorebooks(history, output, true);
            }
        }

        function setActiveLorebooks(history: LlmapiHistory, message: StoryHistoryMessage, includeOutput: boolean) {
            console.debug("setActiveLorebooks: message", message);
            if (!message.properties[engineArrayName]) {
                tryFillActiveLorebooks(cache.entries, {
                    history, message,
                    variables: generateCurrentVariables(ctx.history, includeOutput)
                });
            }
            for (const lorebookName of message.properties[engineArrayName]) {
                const lorebook = cache.entries[lorebookName];
                if (lorebook) {
                    prepareLorebooks.push(lorebook);
                }
            }
        }
    },
    onProcessOutput: async (ctx) => {
        const message = getCurrentOutput(ctx.history);
        if (message) {
            const cache: LorebookConversationCache = ctx.slot.content[engineArrayName];

            tryFillActiveLorebooks(cache.entries, {
                history: ctx.history, message,
                variables: generateCurrentVariables(ctx.history, true)
            });
        }
    }
};
