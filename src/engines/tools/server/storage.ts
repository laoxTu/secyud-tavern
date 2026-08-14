import {createSimpleStorageProvider} from "@/business/server/storage-models";
import {enginePlural, engineName, LlmapiToolConfigModel} from "../models";
import {LlmapiModel} from "@/modules/llmapis/models";
import {llmapiRepository} from "@/modules/llmapis/server/repository";
import {PresetModel} from "@/modules/presets/models";
import {presetRepository} from "@/modules/presets/server/repository";

export const toolLlmapiStorageProvider =
    createSimpleStorageProvider<LlmapiModel, LlmapiToolConfigModel>(
        engineName, enginePlural, llmapiRepository
    );
export const toolPresetStorageProvider =
    createSimpleStorageProvider<PresetModel, LlmapiToolConfigModel>(
        engineName, enginePlural, presetRepository
    );