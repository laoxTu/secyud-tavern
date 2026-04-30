import {ModelStorageProvider} from "@/server/business";
import {presetRepository as repository} from "..";
import assert from "node:assert";
import {PresetModel} from "@/shared/business/presets";

const type = "script";

export const scriptStorageProvider: ModelStorageProvider<PresetModel> = {
    id: type,
    loadModel: async (model: PresetModel) => {
        assert(model.entries !== undefined);
        const entries = await repository.entry.getList(model.id, type);
        model.entries.scripts = entries.data;
    },
    saveModel: async (model: PresetModel) => {
        assert(model.entries !== undefined);
        if (Array.isArray(model.entries.scripts)) {
            await repository.entry.batchCreate(model.id, type, model.entries.script);
        }
    },
    bindSearch: entry => {
        return entry.name;
    }
} as const;