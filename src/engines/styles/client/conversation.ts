import {SlotContentRenderer, SlotInitializer, slotUtils} from "@/modules/stories/client/conversation-models";
import {engineName, enginePlural, PresetStyleModel} from "../models";
import {slotContext} from "@/modules/stories/client/context";
import {businessUtils} from "@/business/models";
import {PresetModel} from "@/modules/presets/models";

const prefix = "injected-style";

export interface StyleConversationCache {
    entries: PresetStyleModel[];
}

export const styleConversationProvider:
    SlotInitializer
    & SlotContentRenderer
    = {
    id: engineName,
    onInitialize: async ({slot}) => {
        const cache: StyleConversationCache = {
            entries: [],
        };
        await businessUtils.useEntriesList<PresetStyleModel, PresetModel>(
            slot.presets, enginePlural, m => m.code,
            async entry => {
                if (entry.disabled) return;
                cache.entries.push(entry);
            });
        cache.entries.sort((a, b) => a.priority - b.priority);
        slotUtils.setProperty(slot, enginePlural, cache);
    },
    onRenderContent: async (ctx) => {
        const {window, document} = slotContext.iframeData;

        if (!window.__injectedStyleInitialized && document) {
            window.__injectedStyleInitialized = true;
            console.debug('[style]: start inject');
            const cache: StyleConversationCache = slotUtils.getProperty(ctx.slot, enginePlural);
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
