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
import {businessUtils} from "@/business/models";
import {PresetModel} from "@/modules/presets/models";
import {BusinessError} from "@/handler/models";
import {getMacroSelectorState} from "@/engines/macros/client/slot-feature";

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

    const macrObj: Record<string, any> = {};

    for (const macro of Object.values(cache.macros)) {
        const entries = macro.multiples
            .filter(v => !v.disabled);
        if (macro.select) entries.unshift(macro.singles[macro.select]);
        macrObj[macro.key] = joinAsString(entries, "", u => u.value);
    }

    return {
        ...macrObj,
        ...(properties.args ?? {}),
        variables: historyUtils.getVariables(history, false),
    }
}

export interface MacroConversationCacheItem {
    key: string,
    singles: Record<string, PresetMacroModel>,
    multiples: PresetMacroModel[],
    select?: string,
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
        const {checkItems, selections} = getMacroSelectorState(slot);
        await businessUtils.useEntriesList<PresetMacroModel, PresetModel>(
            slot.presets, enginePlural, m => m.code,
            async (entry) => {
                if (!entry.id)
                    throw new BusinessError("id is null for entry in slot.");
                const item = cache.macros[entry.key] ??= {
                    key: entry.key,
                    multiples: [],
                    singles: {},
                    hidden: true,
                };
                if (!entry.hidden) item.hidden = false;
                if (entry.multiple) {
                    item.multiples.push(entry);
                    const checked = checkItems[entry.id];
                    if (checked !== undefined)
                        entry.disabled = !checked;
                } else {
                    item.singles[entry.id] = entry;
                    if ((!entry.disabled && !item.select) ||
                        // 防止缓存中的值没有对应的item，校验后添加
                        selections[item.key] === entry.id)
                        item.select = entry.id;
                }
            });
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
