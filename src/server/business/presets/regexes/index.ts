import {ModelStorageProvider} from "@/server/business";
import {presetRepository as repository} from "..";
import assert from "node:assert";
import {PresetModel} from "@/shared/business/presets";

const type = "regex";

export const regexStorageProvider: ModelStorageProvider<PresetModel> = {
    id: type,
    loadModel: async (model: PresetModel) => {
        assert(model.entries);
        const entries = await repository.entry.getList(model.id, type);
        model.entries.regexes = entries.data;
    },
    saveModel: async (model: PresetModel) => {
        assert(model.entries);
        if (Array.isArray(model.entries.regexes)) {
            await repository.entry.batchCreate(model.id, type, model.entries.regex);
        }
    },
    bindSearch: entry => {
        return entry.name;
    }
} as const;