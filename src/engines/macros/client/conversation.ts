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
import {generateCurrentVariables} from "@/slots/client/conversation";
import {SlotModel} from "@/slots/models";
import {StoryHistory} from "@/stories/models";

const eta = new Eta();

function buildMacroObject(ctx: { slot: SlotModel, history: StoryHistory }) {
    const macroObject: Record<string, any> = ctx.slot.content[engineArrayName];
    return {
        ...macroObject,
        variables: generateCurrentVariables(ctx.history, false),
    }
}

export const macroLlmapiInputProcesser: LlmapiInputProcesser = {
    id: engineName,
    requires: [llmapiModuleName],
    onProcessInput: async (ctx) => {
        for (const message of ctx.messages) {
            message.content = eta.renderString(
                message.content, buildMacroObject(ctx));
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
        ctx.output = eta.renderString(ctx.output, buildMacroObject(ctx));
    },
    onRenderContent: async (ctx) => {
        const macroObject = buildMacroObject(ctx);
        for (let i = 0; i < ctx.inputs.length; i++) {
            ctx.inputs[i] = eta.renderString(ctx.inputs[i], macroObject);
        }
        ctx.output = eta.renderString(ctx.output, macroObject);
    }
};
