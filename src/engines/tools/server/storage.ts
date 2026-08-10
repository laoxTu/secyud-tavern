import {createSimpleStorageProvider} from "@/business/server/storage-models";
import {enginePlural, engineName, LlmapiToolConfigModel} from "../models";
import {LlmapiModel} from "@/modules/llmapis/models";
import {llmapiRepository} from "@/modules/llmapis/server/repository";

export const toolStorageProvider =
    createSimpleStorageProvider<LlmapiModel, LlmapiToolConfigModel>(
        engineName, enginePlural, llmapiRepository
    );