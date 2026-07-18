import {imageEntryName, imageEntryPlural, StoryImageModel, StoryModel} from "@/modules/stories/models";
import {storyRepository} from "@/modules/stories/server/repository";
import {createSimpleStorageProvider} from "@/business/server/storage-models";


export const imageStorageProvider =
    createSimpleStorageProvider<StoryModel, StoryImageModel>(
        imageEntryName, imageEntryPlural, storyRepository,
        u => `${u.code}${u.name}`,
        u => `${u.code}${u.name}`,
    );