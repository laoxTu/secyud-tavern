import {engineName, enginePlural, PresetMacroModel} from "../models";
import {
    getContent,
    LlmapiInputProcesser,
    setContent,
    SlotContentRenderer,
    SlotInitializer,
    SlotStreamRenderer
} from "@/modules/slots/client/conversation-models";
import {Eta} from 'eta/core';
import {generateCurrentVariables} from "@/modules/slots/client/conversation";
import {SlotModel} from "@/modules/slots/models";
import {StoryHistory} from "@/modules/stories/models";
import {joinAsString} from "@/utils";

const eta = new Eta({
    autoTrim: false,
    rmWhitespace: false,
});

function buildMacroObject(ctx: { slot: SlotModel, history: StoryHistory }) {
    const cache: MacroConversationCache = getContent(ctx.slot, enginePlural);

    return {
        ...Object.fromEntries(Object.values(cache.macros).map(u => {
            return [u.key, joinAsString(
                [u.models[u.select],
                    ...u.models.filter(v => v.multiple && !v.disabled)
                ], "", u => u.value)]
        })),
        variables: generateCurrentVariables(ctx.history, false),
    }
}

export interface MacroConversationCacheItem {
    key: string,
    models: PresetMacroModel[],
    select: number,
}

export interface MacroConversationCache {
    macros: Record<string, MacroConversationCacheItem>;
}

export const macroLlmapiInputProcesser: LlmapiInputProcesser = {
    id: engineName,
    requires: [],
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
    onInitialize: async (ctx) => {
        const cache: MacroConversationCache = {
            macros: {}
        }
        for (const preset of ctx.slot.presets) {
            const entries: PresetMacroModel[] = preset.entries?.[enginePlural];
            if (!entries) continue;
            for (const entry of entries) {
                const item = cache.macros[entry.key] ??= {
                    key: entry.key,
                    select: 0,
                    models: [],
                };
                item.models.push(entry);
                if (!entry.disabled) {
                    item.select = item.models.length - 1;
                }
            }
        }
        setContent(ctx.slot, enginePlural, cache);
    },
    onRenderStream: async (ctx) => {
        const data = ctx.data;
        data.output = await eta.renderStringAsync(data.output, buildMacroObject(ctx));
    },
    onRenderContent: async (ctx) => {
        const macroObject = buildMacroObject(ctx);
        const data = ctx.data;
        const inputs = data.inputs;
        for (let i = 0; i < inputs.length; i++) {
            inputs[i] = await eta.renderStringAsync(inputs[i], macroObject);
        }
        data.output = await eta.renderStringAsync(data.output, macroObject);
    }
};
