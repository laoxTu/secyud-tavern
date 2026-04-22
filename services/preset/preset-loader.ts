import {PresetEntity} from "@/db/repositories/preset-repository";
import {PresetModel} from "@/models/preset-model";

export interface PresetConverter {
    convertEntityToModel: (entity: PresetEntity, model: PresetModel,) => Promise<void>;
    convertModelToEntity: (model: PresetModel, entity: PresetEntity,) => Promise<void>;
}

const converters: PresetConverter[] = [];

export const presetLoader = {
    registerConverter: (converter: PresetConverter) => {
        converters.push(converter);
    },
    unregisterConverter: (converter: PresetConverter) => {
        converters.splice(converters.indexOf(converter), 1);
    },
    convertEntityToModel: async (entity: PresetEntity, model: PresetModel,) => {
        for (const converter of converters) {
            await converter.convertEntityToModel(entity, model);
        }
    },
    convertModelToEntity: async (model: PresetModel, entity: PresetEntity,) => {
        for (const converter of converters) {
            await converter.convertModelToEntity(model, entity,);
        }
    },
};