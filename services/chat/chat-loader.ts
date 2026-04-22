import {ChatEntity} from "@/db/repositories/chat-repository";
import {ChatModel} from "@/models/chat-model";

export interface ChatConverter {
    convertEntityToModel: (entity: ChatEntity, model: ChatModel,) => Promise<void>;
    convertModelToEntity: (model: ChatModel, entity: ChatEntity,) => Promise<void>;
}

const converters: ChatConverter[] = [];

export const chatLoader = {
    registerConverter: (converter: ChatConverter) => {
        converters.push(converter);
    },
    unregisterConverter: (converter: ChatConverter) => {
        converters.splice(converters.indexOf(converter), 1);
    },
    convertEntityToModel: async (entity: ChatEntity, model: ChatModel,) => {
        for (const converter of converters) {
            await converter.convertEntityToModel(entity, model);
        }
    },
    convertModelToEntity: async (model: ChatModel, entity: ChatEntity,) => {
        for (const converter of converters) {
            await converter.convertModelToEntity(model, entity,);
        }
    },
};