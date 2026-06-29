'use client';
import {
    renderData,
    SlotContentRenderer,
    SlotInitializer,
    SlotStreamRenderer
} from "@/slots/client/conversation-models";
import {EntryModel} from "@/business/models";
import {PresetScriptModel, engineName, engineArrayName} from "../models";
import {engineName as regexEngineName} from "../../regexes/models";
import {generateCurrentVariables} from "@/slots/client/conversation";

const prefix = "injected-script";

export const scriptConversationProvider:
    SlotInitializer
    & SlotContentRenderer
    & SlotStreamRenderer
    = {
    id: engineName,
    requires: [regexEngineName],
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
    onRenderStream: async (ctx) => {
        renderData(ctx, "variables", generateCurrentVariables(ctx.history));
    },
    onRenderContent: async (ctx) => {
        const window = (ctx.window as any);
        if (!window.__injectedScriptInitialized) {
            window.__injectedScriptInitialized = true;
            console.debug('start generate injected-scripts');
            const set = new Set<string>();
            const slotEntries: PresetScriptModel[] = ctx.slot.content[engineArrayName];
            for (const slotEntry of slotEntries) {
                const id = `${prefix}-${slotEntry.code}`;
                if (set.has(id)) continue;
                set.add(id);
                const script = ctx.document.createElement("script");
                script.id = id;
                // link 类型意味着链接
                if (slotEntry.type === 'link') {
                    script.src = slotEntry.content.trim();
                } else {
                    script.type = slotEntry.type ?? "";
                    script.innerHTML = slotEntry.content;
                }
                await new Promise((resolve, reject) => {
                    if (script.type === 'importmap') {
                        ctx.document.head.appendChild(script);
                        resolve(undefined);
                    } else {
                        script.onload = resolve;
                        script.onerror = reject;
                        ctx.document.body.appendChild(script);
                    }
                });
            }
        }
        renderData(ctx, "variables", generateCurrentVariables(ctx.history));
    }
};
