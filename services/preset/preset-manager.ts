// services/preset/preset-manager.ts
import {PresetModel} from "@/models/preset-model";

export interface PresetLoader {
    loadModel: (model: PresetModel,) => Promise<void>;
    saveModel: (model: PresetModel,) => Promise<void>;
}

const converters: PresetLoader[] = [];

export const presetManager = {
    registerLoader: (converter: PresetLoader) => {
        converters.push(converter);
    },
    unregisterLoader: (converter: PresetLoader) => {
        converters.splice(converters.indexOf(converter), 1);
    },
    loadModel: async (model: PresetModel,) => {
        for (const converter of converters) {
            await converter.loadModel(model,);
        }
    },
    saveModel: async (model: PresetModel,) => {
        for (const converter of converters) {
            await converter.saveModel(model,);
        }
    },
};