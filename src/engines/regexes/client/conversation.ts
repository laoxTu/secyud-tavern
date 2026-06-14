import {
    LlmapiInputProcesser,
    SlotContentRenderer,
    SlotInitializer,
    SlotStreamRenderer
} from "@/slots/client/conversation-models";
import {engineName, engineArrayName, PresetRegexModel} from "../models";
import {getCurrentOutput} from "@/stories/models";
import {engineName as lorebookEngineName} from "../../lorebooks/models";

const inputRegexesName = engineArrayName + "Input";
const outputRegexesName = engineArrayName + "Output";

function applyRegexes(regexes: PresetRegexModel[], text?: string) {
    if (!text || text == '') return '';
    for (const regex of regexes) {
        text = text.replace(regex.pattern, regex.replacement);
    }
    return text;
}

export const regexLlmapiInputProcesser:LlmapiInputProcesser = {
    id: engineName,
    requires: [lorebookEngineName],
    onProcessInput: async (ctx) => {
        const regexes = ctx.slot.content[inputRegexesName] as PresetRegexModel[];
        for (const message of ctx.histories) {
            for (const input of message.inputs) {
                input.content = applyRegexes(regexes, input.content);
            }
            const output = getCurrentOutput(message);
            if (output) {
                output.content = applyRegexes(regexes, output.content,);
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
        const regexesInput: PresetRegexModel[] = [];
        const regexesOutput: PresetRegexModel[] = [];
        for (const preset of ctx.slot.presets) {
            const entries = preset.entries?.[engineArrayName] as PresetRegexModel[];
            if (!entries) continue;
            for (const entry of entries) {
                if (entry.disabled) continue;
                if (entry.target == "both" || entry.target == "input") {
                    regexesInput.push(entry);
                }
                if (entry.target == "both" || entry.target == "output") {
                    regexesOutput.push(entry);
                }
            }
        }
        ctx.slot.content[inputRegexesName] = regexesInput;
        ctx.slot.content[outputRegexesName] = regexesOutput;
    },
    onRenderStream: async (ctx) => {
        const regexes = ctx.slot.content[outputRegexesName] as PresetRegexModel[];
        ctx.output = applyRegexes(regexes, ctx.output);
    },
    onRenderContent: async (ctx) => {
        const regexes = ctx.slot.content[outputRegexesName] as PresetRegexModel[];
        console.debug('start apply regex for input');
        for (let i = 0; i < ctx.inputs.length; i++) {
            ctx.inputs[i] = applyRegexes(regexes, ctx.inputs[i]);
        }

        console.debug('start apply regex for output');
        ctx.output = applyRegexes(regexes, ctx.output);
    }
};
