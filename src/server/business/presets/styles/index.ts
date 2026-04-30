import {ModelStorageProvider} from "@/server/business";
import {presetRepository as repository} from "..";
import assert from "node:assert";
import {PresetModel} from "@/shared/business/presets";

const type = "style";

export const styleStorageProvider: ModelStorageProvider<PresetModel> = {
    id: type,
    loadModel: async (model: PresetModel) => {
        assert(model.entries !== undefined);
        const entries = await repository.entry.getList(model.id, type);
        model.entries.styles = entries.data;
    },
    saveModel: async (model: PresetModel) => {
        assert(model.entries !== undefined);
        if (Array.isArray(model.entries.styles)) {
            await repository.entry.batchCreate(model.id, type, model.entries.style);
        }
    },
    bindSearch: entry => {
        return entry.name;
    }
} as const;