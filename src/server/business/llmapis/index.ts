import {createRepository} from "@/server/business/repository-base";
import {ModelStorage} from "@/server/business/model-storage";
import {LlmapiModel} from "@/shared/business/llmapis";
import {llmapis, llmapiEntries} from "./database"

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
            key: model.key,
        }),
        (entity): Partial<LlmapiModel> => ({
            code: entity.code,
            version: entity.version,
            key: entity.key,
        })
    )

