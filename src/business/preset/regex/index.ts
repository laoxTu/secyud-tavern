import {ModelStorageProvider} from "@/models/storage";
import {PresetModel} from "@/business/preset/models";
import {repository} from "../repository";
import assert from "node:assert";

const type = "regex";

export const regexStorageProvider: ModelStorageProvider<PresetModel> = {
    id: type,
    loadModel: async (model: PresetModel) => {
        assert(model.entries !== undefined);
        const entries = await repository.entry.getList(model.id, type);
        model.entries.regexes = entries.data;
    },
    saveModel: async (model: PresetModel) => {
        assert(model.entries !== undefined);
        if (Array.isArray(model.entries.regexes)) {
            await repository.entry.batchCreate(model.id, type, model.entries.regex);
        }
    },
    bindSearch: entry => {
        return entry.name;
    }
} as const;