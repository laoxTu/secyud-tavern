import {
    LlmapiInputProcesser,
    SlotContentRenderer,
    SlotInitializer,
    SlotStreamRenderer
} from "@/slots/client/conversation-models";
import {engineName, engineArrayName, PresetRegexModel} from "../models";
import {getCurrentOutput} from "@/stories/models";
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
        const cache: RegexConversationCache = ctx.slot.content[engineArrayName]
        for (const message of ctx.histories) {
            for (const input of message.inputs) {
                input.content = applyRegexes(cache.inputs, input.content);
            }
            const output = getCurrentOutput(message);
            if (output) {
                output.content = applyRegexes(cache.inputs, output.content,);
            }
        }
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
            const entries: PresetRegexModel[] = preset.entries?.[engineArrayName];
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
        ctx.slot.content[engineArrayName] = cache;
    },
    onRenderStream: async (ctx) => {
        const cache: RegexConversationCache = ctx.slot.content[engineArrayName]
        const data = ctx.data;
        data.output = applyRegexes(cache.outputs, data.output);
    },
    onRenderContent: async (ctx) => {
        const cache: RegexConversationCache = ctx.slot.content[engineArrayName]
        console.debug('start apply regex for input');
        const data = ctx.data;
        const inputs = data.inputs;
        for (let i = 0; i < inputs.length; i++) {
            inputs[i] = applyRegexes(cache.outputs, inputs[i]);
        }

        console.debug('start apply regex for output');
        data.output = applyRegexes(cache.outputs, data.output);
    }
};
