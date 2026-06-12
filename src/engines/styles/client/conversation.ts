import {ConversationProvider} from "@/slots/client/conversation-models";
import {PresetStyleModel, engineName, engineArrayName} from "../models";
import {EntryModel} from "@/business/models";

const styleId = "injected-styles";

export const styleConversationProvider: ConversationProvider = {
    id: engineName,
    onInitialize: async (ctx) => {
        const slotEntries = [];
        for (const preset of ctx.slot.presets) {
            const entries: (PresetStyleModel & EntryModel)[] = preset.entries?.[engineArrayName];
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
        if (!ctx.document.getElementById(styleId)) {
            console.debug('start generate injected-styles');
            const styles = ctx.document.createElement("style");
            styles.id = styleId;
            const slotEntries: PresetStyleModel[] = ctx.slot.content[engineArrayName];
            styles.innerHTML = slotEntries.map((u) => u.content).join("\n");
            ctx.document.head.appendChild(styles)
        }
    }
};
