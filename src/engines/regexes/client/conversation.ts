import {
    getContent,
    LlmapiInputProcesser,
    setContent,
    SlotContentRenderer,
    SlotInitializer,
    SlotStreamRenderer
} from "@/modules/slots/client/conversation-models";
import {engineName, enginePlural, PresetRegexModel} from "../models";
import {engineName as lorebookEngineName} from "../../lorebooks/models";

export interface RegexConversationCache {
    inputs: PresetRegexModel[];
    outputs: PresetRegexModel[];
}

function applyRegexes(regexes: PresetRegexModel[], text?: string) {
    if (!text || text == '') return '';
    for (const regex of regexes) {
        text = text.replace(regex.pattern, regex.replacement);
    }
    return text;
}

export const regexLlmapiInputProcesser: LlmapiInputProcesser = {
    id: engineName,
    requires: [lorebookEngineName],
    onProcessInput: async (ctx) => {
        const cache: RegexConversationCache = getContent(ctx.slot, enginePlural)
        const generate = async (str: string, role: string) => {
            return role !== "tool" ? applyRegexes(cache.inputs, str,) : str;
        };
        ctx.contentHandlers.push(generate);
    },
}


export const regexConversationProvider:
    SlotInitializer
    & SlotStreamRenderer
    & SlotContentRenderer
    = {
    id: engineName,
    onInitialize: async (ctx) => {
        const cache: RegexConversationCache = {
            inputs: [],
            outputs: []
        }
        for (const preset of ctx.slot.presets) {
            const entries: PresetRegexModel[] = preset.entries?.[enginePlural];
            if (!entries) continue;
            for (const entry of entries) {
                if (entry.disabled) continue;
                if (entry.target == "both" || entry.target == "input") {
                    cache.inputs.push(entry);
                }
                if (entry.target == "both" || entry.target == "output") {
                    cache.outputs.push(entry);
                }
            }
        }
        setContent(ctx.slot, enginePlural, cache);
    },
    onRenderStream: async (ctx) => {
        const cache: RegexConversationCache = getContent(ctx.slot, enginePlural)
        const data = ctx.data;
        data.output = applyRegexes(cache.outputs, data.output);
    },
    onRenderContent: async (ctx) => {
        const cache: RegexConversationCache = getContent(ctx.slot, enginePlural)
        const data = ctx.data;
        const inputs = data.inputs;
        for (let i = 0; i < inputs.length; i++) {
            inputs[i] = applyRegexes(cache.outputs, inputs[i]);
        }
        data.output = applyRegexes(cache.outputs, data.output);
    }
};
