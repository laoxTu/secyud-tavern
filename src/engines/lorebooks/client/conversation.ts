import {ConversationProvider} from "@/slots/client/conversation-models";
import { engineName, engineArrayName} from "../models";

// TODO
export const lorebookConversationProvider: ConversationProvider = {
    id: engineName,
    onInitialize: async (ctx) => {
        const lorebooks = [];
        for (const preset of ctx.slot.presets) {
            const entryLorebooks= preset.entries?.[engineArrayName];
            if (!entryLorebooks) continue;
            for (const lorebook of entryLorebooks) {
                if (lorebook.disabled) continue;
                lorebooks.push(lorebook);
            }
        }
        ctx.slot.content.lorebooks = lorebooks;
    },
    onRenderStream: async () => {
    },
    onProcessInput: async (ctx) => {
    },
    onProcessOutput: async () => {
    },
    onRenderPage: async (ctx) => {
    }
};
