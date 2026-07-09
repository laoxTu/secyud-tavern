import {SlotContentRenderer, SlotInitializer} from "@/modules/slots/client/conversation-models";
import {PresetStyleModel, engineName, enginePlural} from "../models";

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
        ctx.slot.content[enginePlural] = cache;
    },
    onRenderContent: async (ctx) => {
        const window = (ctx.window as any);
        if (window.__injectedStyleInitialized) {
            return;
        }
        window.__injectedStyleInitialized = true;
        console.debug('[injected-styles] start generate');
        const cache: StyleConversationCache = ctx.slot.content[enginePlural];
        const set = new Set<string>();
        for (const entry of cache.entries) {
            const id = `${prefix}-${entry.code}`;
            if (set.has(id)) continue;
            set.add(id);
            if (entry.type === 'link') {
                // style 的链接用的是link[rel='stylesheet']的href
                const link = ctx.document.createElement("link");
                link.id = id;
                link.rel = "stylesheet";
                link.href = entry.content.trim();
                ctx.document.head.appendChild(link)
            } else {
                const style = ctx.document.createElement("style");
                style.id = id;
                style.innerHTML = entry.content;
                ctx.document.head.appendChild(style)
            }
        }
    }
};
