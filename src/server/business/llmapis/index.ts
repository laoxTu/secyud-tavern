import {createRepository} from "@/server/business/repository-base";
import {ModelStorage} from "@/server/business/model-storage";
import {llmapis, llmapiEntries} from "./database"
import {LlmapiModel} from "@/shared/business/llmapis";
import {PresetModel} from "@/shared/business/presets";

export {llmapis, llmapiEntries};
export const llmapiStorage = new ModelStorage<LlmapiModel>("llmapi",)

export const llmapiRepository =
    createRepository<LlmapiModel, typeof llmapis.$inferSelect>(
        llmapis, llmapiEntries,
        llmapiStorage.loadModel.bind(llmapiStorage),
        llmapiStorage.saveModel.bind(llmapiStorage),
        llmapiStorage.bindSearch.bind(llmapiStorage),
        (model) => ({
            code: model.code,
            version: model.version,
        }),
        (entity): Partial<PresetModel> => ({
            code: entity.code,
            version: entity.version,
        })
    )

