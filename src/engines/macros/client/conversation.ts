import {ConversationProvider} from "@/slots/client/conversation-models";
import {engineName} from "../models";
import {engineName as lorebookEngineName} from "../../lorebooks/models";



export const macroConversationProvider: ConversationProvider = {
    id: engineName,
    requires: [lorebookEngineName],
    onInitialize: async (ctx) => {
    },
    onRenderStream: async (ctx) => {
    },
    onProcessInput: async (ctx) => {
    },
    onProcessOutput: async () => {
    },
    onRenderPage: async (ctx) => {
    }
};
