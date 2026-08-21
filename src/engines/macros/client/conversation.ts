import {engineName, enginePlural, PresetMacroModel} from "../models";
import {
    LlmapiInputProcesser,
    SlotContentRenderer,
    SlotContextBase,
    SlotInitializer,
    SlotStreamRenderer,
    slotUtils
} from "@/modules/stories/client/conversation-models";
import {Eta} from 'eta/core';
import {joinAsString} from "@/utils";
import {engineName as regexEngineName} from "@/engines/regexes/models"
import {historyUtils, SlotHistory} from "@/modules/models";

const eta = new Eta({
    autoTrim: false,
    rmWhitespace: false,
});

function buildMacroObject(
    {history, slot, properties}: SlotContextBase & {
        history: SlotHistory
    }) {
    const cache = slotUtils
        .getProperty<MacroConversationCache>(slot, enginePlural);

    return {
        ...Object.fromEntries(Object.values(cache.macros).map(u => {
            return [u.key, joinAsString(
                [u.select < 0 ? null : u.singles[u.select],
                    ...u.multiples.filter(v => !v.disabled)
                ], "", u => u?.value)]
        })),
        ...(properties.args ?? {}),
        variables: historyUtils.getVariables(history, false),
    }
}

export interface MacroConversationCacheItem {
    key: string,
    singles: PresetMacroModel[],
    multiples: PresetMacroModel[],
    select: number,
    hidden: boolean,
}

export interface MacroConversationCache {
    macros: Record<string, MacroConversationCacheItem>;
}

export const macroLlmapiInputProcesser: LlmapiInputProcesser = {
    id: engineName,
    requires: [regexEngineName],
    sequence: 1000,
    onProcessInput: async (ctx) => {
        const macroObject = buildMacroObject(ctx);
        const generate = async (str: string, role: string) => {
            return role !== "tool" ? await eta.renderStringAsync(str, macroObject) : str;
        };
        ctx.contentHandlers.push(generate);
    },
}

export const macroConversationProvider:
    SlotInitializer
    & SlotContentRenderer
    & SlotStreamRenderer
    = {
    id: engineName,
    requires: [regexEngineName],
    onInitialize: async ({slot}) => {
        const cache: MacroConversationCache = {
            macros: {}
        }
        for (const preset of slot.presets) {
            const entries: PresetMacroModel[] = preset.entries?.[enginePlural];
            if (!entries) continue;
            for (const entry of entries) {
                const item = cache.macros[entry.key] ??= {
                    key: entry.key,
                    select: -1,
                    multiples: [],
                    singles: [],
                    hidden: true,
                };
                if (!entry.hidden) item.hidden = false;
                if (entry.multiple) {
                    item.multiples.push(entry);
                } else {
                    if (!entry.disabled)
                        item.select = item.singles.length;
                    item.singles.push(entry);
                }
            }
        }
        slotUtils.setProperty(slot, enginePlural, cache);
    },
    onRenderStream: async (ctx) => {
        const macroObject = buildMacroObject(ctx);
        const generate = async (str: string) => {
            return await eta.renderStringAsync(str, macroObject);
        };
        ctx.contentHandlers.push(generate);
    },
    onRenderContent: async (ctx) => {
        const macroObject = buildMacroObject(ctx);
        const generate = async (str: string) => {
            return await eta.renderStringAsync(str, macroObject);
        };
        ctx.contentHandlers.push(generate);
    }
};
