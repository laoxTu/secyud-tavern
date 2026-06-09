import {ConversationProvider} from "@/slots/client/conversation-models";
import {PresetScriptModel, engineName, engineArrayName} from "../models";
import {PresetStyleModel} from "@/engines/styles/models";
import {EntryModel} from "@/business/models";


export const scriptConversationProvider: ConversationProvider = {
    id: engineName,
    onInitialize: async (ctx) => {
        const slotEntries = [];
        for (const preset of ctx.slot.presets) {
            const entries: (PresetScriptModel & EntryModel)[] = preset.entries?.[engineArrayName];
            if (!entries) continue;
            for (const entry of entries) {
                if (entry.disabled) continue;
                slotEntries.push(entry);
            }
        }
        slotEntries.sort((a, b) => a.priority - b.priority);
        ctx.slot.content[engineArrayName] = slotEntries;
    },
    onRenderStream: async () => {
    },
    onProcessInput: async () => {
    },
    onProcessOutput: async () => {
    },
    onRenderPage: async (ctx) => {
        const slotEntries: PresetStyleModel[] = ctx.slot.content[engineArrayName];
        for (const entry of slotEntries) {
            const element = ctx.document.createElement('script');
            element.innerHTML = entry.content;
            ctx.document.body.appendChild(element);
        }
    }
};
