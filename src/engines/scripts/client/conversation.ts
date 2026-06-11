'use client';
import {ConversationProvider} from "@/slots/client/conversation-models";
import {PresetStyleModel} from "@/engines/styles/models";
import {EntryModel} from "@/business/models";
import {PresetScriptModel, engineName, engineArrayName} from "../models";
import {engineName as regexEngineName} from "../../regexes/models";
import {generateCurrentVariables} from "@/slots/client/conversation";


export const scriptConversationProvider: ConversationProvider = {
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
        const variables = generateCurrentVariables(ctx.history);
        const variableField = ctx.document.getElementById('variable-state')!;
        variableField.innerHTML = `const variables = ${JSON.stringify(variables)};`;
    },
    onProcessInput: async () => {
    },
    onProcessOutput: async () => {
    },
    onRenderPage: async (ctx) => {
        const slotEntries: PresetStyleModel[] = ctx.slot.content[engineArrayName];
        for (const entry of slotEntries) {
            const element = ctx.document.createElement('script');
            element.innerHTML = entry.content;
            ctx.document.body.appendChild(element);
        }
        const variables = generateCurrentVariables(ctx.history);
        const variableField = ctx.document.createElement('script');
        variableField.id = 'variable-state';
        variableField.innerHTML = `const variables = ${JSON.stringify(variables)};`;
        ctx.document.body.appendChild(variableField);
    }
};
