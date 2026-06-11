import {ConversationProvider} from "@/slots/client/conversation-models";
import {engineName, engineArrayName, PresetRegexModel} from "../models";
import {engineName as lorebookEngineName, LorebookMessage} from "../../lorebooks/models";
import {getCurrentOutput} from "@/stories/models";

function applyRegexes(regexes: PresetRegexModel[], text?: string) {
    if (!text || text == '') return '';
    for (const regex of regexes) {
        text = text.replace(regex.pattern, regex.replacement);
    }
    return text;
}

function rerenderOutputField(document: Document, content: string) {
    let outputField = document.getElementById('ai-output');
    if (!outputField) {
        outputField = document.createElement('div');
        outputField.id = "ai-output";
        document.body.appendChild(outputField);
    }
    outputField.innerHTML = content;
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
        const regexes = ctx.slot.content[engineArrayName + "Output"] as PresetRegexModel[];
        const output = applyRegexes(regexes, getCurrentOutput(ctx.history)?.content);
        rerenderOutputField(ctx.document, output);
    },
    onProcessInput: async (ctx) => {
        const regexes = ctx.slot.content[engineArrayName + "Input"] as PresetRegexModel[];
        const messages = ctx.content.messages as LorebookMessage[];
        for (const message of messages) {
            for (const input of message.inputs) {
                input.message = applyRegexes(regexes, input.message);
            }
            if (message.output) {
                message.output.message = applyRegexes(regexes, message.output.message,);
            }
        }
    },
    onProcessOutput: async () => {
    },
    onRenderPage: async (ctx) => {
        const regexes = ctx.slot.content[engineArrayName + "Output"] as PresetRegexModel[];
        let inputFields = ctx.document.getElementById("user-input");
        if (!inputFields) {
            inputFields = ctx.document.createElement('div');
            inputFields.id = "user-input";
            ctx.document.body.appendChild(inputFields);
        }
        inputFields.replaceChildren();
        for (const input of ctx.history.inputs) {
            const inputField = document.createElement("div");
            inputField.className = "user-input";
            inputField.innerHTML = applyRegexes(regexes, input.content);
            inputFields.appendChild(inputField);
        }

        const output = applyRegexes(regexes, getCurrentOutput(ctx.history)?.content);
        rerenderOutputField(ctx.document, output);
    }
};
