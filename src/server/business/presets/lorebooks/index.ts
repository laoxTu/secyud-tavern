import {ModelStorageProvider} from "@/server/business";
import {presetRepository as repository} from "..";
import assert from "node:assert";
import {PresetModel} from "@/shared/business/presets";

const type = "lorebook";

export const lorebookStorageProvider: ModelStorageProvider<PresetModel> = {
    id: type,
    loadModel: async (model: PresetModel) => {
        assert(model.entries);
        const entries = await repository.entry.getList(model.id, type);
        model.entries.lorebooks = entries.data;
    },
    saveModel: async (model: PresetModel) => {
        assert(model.entries);
        if (Array.isArray(model.entries.lorebooks)) {
            await repository.entry.batchCreate(model.id, type, model.entries.lorebook);
        }
    },
    bindSearch: entry => {
        return entry.name;
    }
} as const;