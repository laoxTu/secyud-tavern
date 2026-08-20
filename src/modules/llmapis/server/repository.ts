import {LlmapiModel} from "../models";
import {llmapiEntries, llmapis} from "./db-entities";
import {llmapiStorage} from "./storage";
import {createRepository} from "@/business/server/repository";

export const llmapiRepository =
    createRepository<LlmapiModel, typeof llmapis.$inferSelect>(
        llmapis, llmapiEntries, llmapiStorage,
        (model) => ({
            code: model.code,
            version: model.version,
            key: model.key,
            iv: model.iv,
            provider: model.provider,
            stream: model.stream,
            builder: model.builder,
        }),
        (entity): Partial<LlmapiModel> => ({
            code: entity.code,
            version: entity.version,
            key: entity.key,
            iv: entity.iv,
            provider: entity.provider,
            stream: entity.stream,
            builder: entity.builder,
        })
    )

