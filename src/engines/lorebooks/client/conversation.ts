import {
    engineName,
    engineArrayName,
    PresetLorebookModel,
    compareLorebook,
    setLorebooks,
    setStartLorebooks,
    setEndLorebooks,
    getLorebooks,
    getStartLorebooks,
    getEndLorebooks
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


export const lorebookConversationProvider:
    SlotInitializer
    & LlmapiInputProcesser
    & LlmapiOutputProcesser
    = {
    id: engineName,
    onInitialize: async (ctx) => {
        const lorebooks: Record<string, PresetLorebookModel> = {};
        const startLorebooks: PresetLorebookModel[] = [];
        const endLorebooks: PresetLorebookModel[] = [];
        for (const preset of ctx.slot.presets) {
            const entryLorebooks = preset.entries
                ?.[engineArrayName] as PresetLorebookModel[];
            if (!entryLorebooks) continue;
            for (const lorebook of entryLorebooks) {
                if (lorebook.disabled) continue;
                const id = `${preset.code}-${lorebook.code}`;
                // 替换code，唯一标识
                lorebook.code = id;
                if (lorebook.matchType === matchName) {
                    if (lorebook.matchExpression?.lastMessage)
                        endLorebooks.push(lorebook);
                    else startLorebooks.push(lorebook);
                } else {
                    lorebooks[id] = lorebook;
                }
            }
        }
        setLorebooks(ctx.slot.content, lorebooks);
        setStartLorebooks(ctx.slot.content, startLorebooks);
        setEndLorebooks(ctx.slot.content, endLorebooks);
    },
    onProcessInput: async (ctx) => {
        const lorebooks = getLorebooks(ctx.slot.content);
        setStartLorebooks(ctx.content, getStartLorebooks(ctx.slot.content));
        setEndLorebooks(ctx.content, getEndLorebooks(ctx.slot.content));

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
            console.debug(message);
            console.debug(message.properties);
            if (!message.properties[engineArrayName]) {
                tryFillActiveLorebooks(lorebooks, {
                    history, message,
                    variables: generateCurrentVariables(ctx.history, includeOutput)
                });
            }
            for (const lorebookName of message.properties[engineArrayName]) {
                const lorebook = lorebooks[lorebookName];
                if (lorebook) {
                    prepareLorebooks.push(lorebook);
                }
            }
        }
    },
    onProcessOutput: async (ctx) => {
        const message = getCurrentOutput(ctx.history);
        if (message) {
            const lorebooks = getLorebooks(ctx.slot.content);

            tryFillActiveLorebooks(lorebooks, {
                history: ctx.history, message,
                variables: generateCurrentVariables(ctx.history, true)
            });
        }
    }
};
