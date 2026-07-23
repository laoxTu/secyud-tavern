import {engineName, enginePlural, PresetMacroModel} from "../models";
import {moduleName as llmapiModuleName} from "@/modules/llmapis/models";
import {
    LlmapiInputProcesser,
    SlotContentRenderer,
    SlotInitializer,
    SlotStreamRenderer
} from "@/modules/slots/client/conversation-models";
import {Eta} from 'eta/core';
import {generateCurrentVariables} from "@/modules/slots/client/conversation";
import {SlotModel} from "@/modules/slots/models";
import {StoryHistory} from "@/modules/stories/models";

const eta = new Eta({
    autoTrim: false,
    rmWhitespace: false,
});

function buildMacroObject(ctx: { slot: SlotModel, history: StoryHistory }) {
    const cache: MacroConversationCache = ctx.slot.content[enginePlural];

    return {
        ...Object.fromEntries(Object.values(cache.macros).map(u => [u.key, u.models[u.select].value])),
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
    requires: [llmapiModuleName],
    onProcessInput: async (ctx) => {
        const macroObject = buildMacroObject(ctx);
        for (const message of ctx.messages) {
            const content = eta.renderString(
                message.content, macroObject);
            console.debug("apply macro: ", {
                origin: message.content,
                target: content
            });
            message.content = content;
        }
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
        ctx.slot.content[enginePlural] = cache;
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
