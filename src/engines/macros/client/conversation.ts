import {engineName} from "../models";
import {moduleName as llmapiModuleName} from "@/llmapis/models";
import {
    LlmapiInputProcesser,
    SlotContentRenderer,
    SlotInitializer,
    SlotStreamRenderer
} from "@/slots/client/conversation-models";


export const macroConversationProvider:
    LlmapiInputProcesser
    & SlotInitializer
    & SlotContentRenderer
    & SlotStreamRenderer
    = {
    id: engineName,
    requires: [llmapiModuleName],
    onInitialize: async (ctx) => {
    },
    onRenderStream: async (ctx) => {
    },
    onProcessInput: async (ctx) => {
    },
    onRenderContent: async (ctx) => {

    }
};
