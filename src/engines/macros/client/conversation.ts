import {engineName, engineArrayName, PresetMacroModel} from "../models";
import {moduleName as llmapiModuleName} from "@/llmapis/models";
import {
    LlmapiInputProcesser,
    SlotContentRenderer,
    SlotInitializer,
    SlotStreamRenderer
} from "@/slots/client/conversation-models";
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

export interface MacroConversationCache {
    variables: Record<string, any>;
}

export const macroLlmapiInputProcesser: LlmapiInputProcesser = {
    id: engineName,
    requires: [llmapiModuleName],
    onProcessInput: async (ctx) => {
        const macroObject = buildMacroObject(ctx);
        for (const message of ctx.messages) {
            const content = eta.renderString(
                message.content, macroObject);
            console.debug("apply macro: ", {
                origin: message.content,
                target: content
            });
            message.content = content;
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
        const cache: MacroConversationCache = {
            variables: {}
        }
        for (const preset of ctx.slot.presets) {
            const entries: PresetMacroModel[] = preset.entries?.[engineArrayName];
            if (!entries) continue;
            for (const entry of entries) {
                if (entry.disabled) continue;
                cache.variables[entry.key] = entry.value;
            }
        }
        ctx.slot.content[engineArrayName] = cache;
    },
    onRenderStream: async (ctx) => {
        const data = ctx.data;
        data.output = eta.renderString(data.output, buildMacroObject(ctx));
    },
    onRenderContent: async (ctx) => {
        const macroObject = buildMacroObject(ctx);
        const data = ctx.data;
        const inputs = data.inputs;
        for (let i = 0; i < inputs.length; i++) {
            inputs[i] = eta.renderString(inputs[i], macroObject);
        }
        data.output = eta.renderString(data.output, macroObject);
    }
};
