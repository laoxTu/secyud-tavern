import {ConversationProvider} from "@/slots/client/conversation-models";
import {engineName, engineArrayName, PresetRegexModel} from "../models";
import {engineName as lorebookEngineName, LorebookMessage} from "../../lorebooks/models";
import {getCurrentOutput} from "@/stories/models";

function applyRegexes(text: string, regexes: PresetRegexModel[]) {
    for (const regex of regexes) {
        text = text.replace(regex.pattern, regex.replacement);
    }
    return text;
}

export const regexConversationProvider: ConversationProvider = {
    id: engineName,
    requires: [lorebookEngineName],
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
        ctx.slot.content[engineArrayName + "Input"] = regexesInput;
        ctx.slot.content[engineArrayName + "Output"] = regexesOutput;
    },
    onRenderStream: async (ctx) => {
        const output = getCurrentOutput(ctx.history);
        if (output) {
            const regexes = ctx.slot.content[engineArrayName + "Output"] as PresetRegexModel[];
            const outputElement = ctx.document.getElementById('ai-output')!;
            outputElement.innerHTML = applyRegexes(output.content, regexes);
        }
    },
    onProcessInput: async (ctx) => {
        const regexes = ctx.slot.content[engineArrayName + "Input"] as PresetRegexModel[];
        const messages = ctx.content.messages as LorebookMessage[];
        for (const message of messages) {
            for (const input of message.inputs) {
                input.message = applyRegexes(input.message, regexes);
            }
            if (message.output) {
                message.output.message = applyRegexes(message.output.message, regexes);
            }
        }
    },
    onProcessOutput: async () => {
    },
    onRenderPage: async (ctx) => {
        const regexes = ctx.slot.content[engineArrayName + "Output"] as PresetRegexModel[];
        const inputFields = ctx.document.createElement('div');
        inputFields.className = "user-inputs";
        for (const input of ctx.history.inputs) {
            const inputField = document.createElement("div");
            inputField.className = "user-input";
            inputField.innerHTML = applyRegexes(input.content, regexes);
        }
        ctx.document.body.appendChild(inputFields);
        const outputField = ctx.document.createElement('div');
        outputField.className = "ai-output";
        outputField.id = "ai-output";
        const output = getCurrentOutput(ctx.history);
        if (output) {
            outputField.innerHTML = applyRegexes(output.content, regexes);
        }
        ctx.document.body.appendChild(outputField);
    }
};
