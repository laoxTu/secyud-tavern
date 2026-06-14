import {engineName, engineArrayName, PresetMacroModel} from "../models";
import {moduleName as llmapiModuleName} from "@/llmapis/models";
import {
    LlmapiInputProcesser,
    SlotContentRenderer,
    SlotInitializer,
    SlotStreamRenderer
} from "@/slots/client/conversation-models";
import {EntryModel} from "@/business/models";
import {Eta} from 'eta/core';

const eta = new Eta();

export const macroLlmapiInputProcesser: LlmapiInputProcesser = {
    id: engineName,
    requires: [llmapiModuleName],
    onProcessInput: async (ctx) => {
        const macroObject: Record<string, any> = ctx.slot.content[engineArrayName];
        for (const message of ctx.messages) {
            message.content = eta.renderString(message.content, macroObject);
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
        const macroObject: Record<string, any> = {};
        for (const preset of ctx.slot.presets) {
            const entries: (PresetMacroModel & EntryModel)[] = preset.entries?.[engineArrayName];
            if (!entries) continue;
            for (const entry of entries) {
                if (entry.disabled) continue;
                macroObject[entry.key] = entry.value;
            }
        }
        ctx.slot.content[engineArrayName] = macroObject;
    },
    onRenderStream: async (ctx) => {
        const macroObject: Record<string, any> = ctx.slot.content[engineArrayName];
        ctx.output = eta.renderString(ctx.output, macroObject);
    },

    onRenderContent: async (ctx) => {
        const macroObject: Record<string, any> = ctx.slot.content[engineArrayName];
        for (let i = 0; i < ctx.inputs.length; i++) {
            ctx.inputs[i] = eta.renderString(ctx.inputs[i], macroObject);
        }
        ctx.output = eta.renderString(ctx.output, macroObject);
    }
};
