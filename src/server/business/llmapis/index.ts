import {createRepository} from "@/server/business/repository-base";
import {ModelStorage} from "@/server/business/model-storage";
import {LlmapiModel} from "@/shared/business/llmapis";
import {llmapis, llmapiEntries} from "./database"
import {LlmEngineRegistry} from "./engines";
import {DeepseekEngine} from "@/server/business/llmapis/engines/deepseek";

export function registerLlmapi() {
    llmapiStorage.register(
    );
    llmapiEngineRegistry.register(
        new DeepseekEngine()
    );
}

export {llmapis, llmapiEntries};
export const llmapiStorage = new ModelStorage<LlmapiModel>("llmapi",)
export const llmapiEngineRegistry = new LlmEngineRegistry("llmapi",)

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

