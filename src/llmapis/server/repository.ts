import {LlmapiModel} from "../models";
import {llmapiEntries, llmapis} from "./db-entities";
import {llmapiStorage} from "./storage";
import {createRepository} from "@/business/server/repository";

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

