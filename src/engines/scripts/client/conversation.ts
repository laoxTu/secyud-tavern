'use client';
import {
    SlotContentRenderer,
    SlotInitializer,
    SlotStreamRenderer
} from "@/slots/client/conversation-models";
import {PresetStyleModel} from "@/engines/styles/models";
import {EntryModel} from "@/business/models";
import {PresetScriptModel, engineName, engineArrayName} from "../models";
import {engineName as regexEngineName} from "../../regexes/models";
import {generateCurrentVariables} from "@/slots/client/conversation";

const scriptId = "injected-scripts";

export const scriptConversationProvider:
    SlotInitializer
    & SlotContentRenderer
    & SlotStreamRenderer
    = {
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
        ctx.window.postMessage({type: "variables", data: generateCurrentVariables(ctx.history)}, "*");
    },
    onRenderContent: async (ctx) => {
        if (!ctx.document.getElementById(scriptId)) {
            console.debug('start generate injected-scripts');
            const scripts = ctx.document.createElement("script");
            scripts.id = scriptId;
            const slotEntries: PresetStyleModel[] = ctx.slot.content[engineArrayName];
            scripts.innerHTML = slotEntries.map((u) => u.content).join("\n");
            ctx.document.body.appendChild(scripts)
        }
        ctx.window.postMessage({type: "variables", data: generateCurrentVariables(ctx.history)}, "*");
    }
};
