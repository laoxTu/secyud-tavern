import {SlotContentRenderer, SlotInitializer, slotUtils} from "@/modules/slots/client/conversation-models";
import {engineName, enginePlural, PresetStyleModel} from "../models";
import {slotContext} from "@/modules/slots/client/context";

const prefix = "injected-style";

export interface StyleConversationCache {
    entries: PresetStyleModel[];
}

export const styleConversationProvider:
    SlotInitializer
    & SlotContentRenderer
    = {
    id: engineName,
    onInitialize: async (ctx) => {
        const cache: StyleConversationCache = {
            entries: [],
        };
        for (const preset of ctx.slot.presets) {
            const entries: PresetStyleModel[] = preset
                .entries?.[enginePlural];
            if (!entries) continue;
            for (const entry of entries) {
                if (entry.disabled) continue;
                cache.entries.push(entry);
            }
        }
        cache.entries.sort((a, b) => a.priority - b.priority);
        slotUtils.setContent(ctx.slot, enginePlural, cache);
    },
    onRenderContent: async (ctx) => {
        const {window, document} = slotContext.iframeData;

        if (!window.__injectedStyleInitialized && document) {
            window.__injectedStyleInitialized = true;
            console.debug('[style]: start inject');
            const cache: StyleConversationCache = slotUtils.getContent(ctx.slot, enginePlural);
            const set = new Set<string>();
            for (const entry of cache.entries) {
                const id = `${prefix}-${entry.code}`;
                if (set.has(id)) continue;
                set.add(id);
                if (entry.type === 'link') {
                    // style 的链接用的是link[rel='stylesheet']的href
                    const link = document.createElement("link");
                    link.id = id;
                    link.rel = "stylesheet";
                    link.href = entry.content.trim();
                    document.head.appendChild(link)
                } else {
                    const style = document.createElement("style");
                    style.id = id;
                    style.innerHTML = entry.content;
                    document.head.appendChild(style)
                }
            }
        }
    }
};
