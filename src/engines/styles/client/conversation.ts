import {SlotContentRenderer, SlotInitializer} from "@/slots/client/conversation-models";
import {PresetStyleModel, engineName, engineArrayName} from "../models";
import {EntryModel} from "@/business/models";

const prefix = "injected-style";

export const styleConversationProvider:
    SlotInitializer
    & SlotContentRenderer
    = {
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
    onRenderContent: async (ctx) => {
        const window = (ctx.window as any);
        if (window.__injectedStyleInitialized) {
            return;
        }
        window.__injectedStyleInitialized = true;
        console.debug('[injected-styles] start generate');
        const set = new Set<string>();
        const slotEntries: PresetStyleModel[] = ctx.slot.content[engineArrayName];
        for (const slotEntry of slotEntries) {
            const id = `${prefix}-${slotEntry.code}`;
            if (set.has(id)) continue;
            set.add(id);
            if (slotEntry.type === 'link') {
                const style = ctx.document.createElement("link");
                style.id = id;
                style.rel = "stylesheet";
                style.href = slotEntry.content.trim();
                ctx.document.head.appendChild(style)
            } else {
                const style = ctx.document.createElement("style");
                style.id = id;
                style.innerHTML = slotEntry.content;
                ctx.document.head.appendChild(style)
            }

        }
    }
};
