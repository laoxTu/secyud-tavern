import {
    engineName,
    enginePlural,
    PresetLorebookModel,
} from "../models";
import {matchName} from "../match/always/models";
import {generateCurrentVariables} from "@/modules/slots/client/conversation";
import {tryFillActiveLorebooks} from "@/engines/lorebooks/client/match";
import {
    LlmapiHistory,
    LlmapiInputProcesser,
    LlmapiOutputProcesser,
    SlotInitializer
} from "@/modules/slots/client/conversation-models";
import {getCurrentOutput, StoryHistoryMessage} from "@/modules/stories/models";
import {engineName as ragEngineName} from '@/engines/rags/models';


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
    requires: [ragEngineName],
    onInitialize: async (ctx) => {
        const cache: LorebookConversationCache = {
            before: [],
            after: [],
            entries: {}
        };
        for (const preset of ctx.slot.presets) {
            const entries = preset.entries
                ?.[enginePlural] as PresetLorebookModel[];
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
        ctx.slot.content[enginePlural] = cache;
    },
    onProcessInput: async (ctx) => {
        const cache: LorebookConversationCache = ctx.slot.content[enginePlural];

        const prepareLorebooks: PresetLorebookModel[] = [];
        // 将世界书拷贝到上下文中，用于生成提示词。
        for (const history of ctx.histories) {
            for (const input of history.inputs) {
                setActiveLorebooks(history, input, false);
            }

            const lorebooks = history.properties[enginePlural];
            // 设置缓存，缓存的世界书来源可能不一样，如果前面设置过，需要合并。
            history.properties[enginePlural] = [
                ...(lorebooks ?? []),
                ...prepareLorebooks];

            prepareLorebooks.length = 0;

            const output = getCurrentOutput(history);
            if (output) {
                setActiveLorebooks(history, output, true);
            }
        }

        function setActiveLorebooks(history: LlmapiHistory, message: StoryHistoryMessage, includeOutput: boolean) {
            console.debug("setActiveLorebooks: message", message);
            // 从持久化数据中设置/读取 string[]
            const lorebookNames = message.properties[enginePlural] ??
                tryFillActiveLorebooks(cache.entries, {
                    history, message,
                    variables: generateCurrentVariables(ctx.history, includeOutput)
                });
            for (const lorebookName of lorebookNames) {
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
            const cache: LorebookConversationCache = ctx.slot.content[enginePlural];

            tryFillActiveLorebooks(cache.entries, {
                history: ctx.history, message,
                variables: generateCurrentVariables(ctx.history, true)
            });
        }
    }
};
