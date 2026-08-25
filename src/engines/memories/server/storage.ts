import {createSimpleStorageProvider} from "@/business/server/storage-models";
import {engineName, enginePlural, StoryMemoryModel} from "../models";
import {StoryModel} from "@/modules/stories/models";
import {storyRepository} from "@/modules/stories/server/repository";

export const memoryStorageProvider =
    createSimpleStorageProvider<StoryModel, StoryMemoryModel>(engineName, enginePlural, storyRepository,
        u => `${u.type}${u.code}${u.name}`,
        u => `${u.type}${u.code}${u.name}`
    );