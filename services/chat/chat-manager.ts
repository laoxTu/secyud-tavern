// services/chat/chat-manager.ts
import {ChatModel} from "@/models/chat-model";

export interface ChatLoader {
    loadModel: (model: ChatModel,) => Promise<void>;
    saveModel: (model: ChatModel,) => Promise<void>;
}

const converters: ChatLoader[] = [];

export const chatManager = {
    registerLoader: (converter: ChatLoader) => {
        converters.push(converter);
    },
    unregisterLoader: (converter: ChatLoader) => {
        converters.splice(converters.indexOf(converter), 1);
    },
    loadModel: async (model: ChatModel,) => {
        for (const converter of converters) {
            await converter.loadModel(model,);
        }
    },
    saveModel: async (model: ChatModel,) => {
        for (const converter of converters) {
            await converter.saveModel(model,);
        }
    },
};