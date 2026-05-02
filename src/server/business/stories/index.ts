import {createRepository, ModelStorage} from "@/server/business";
import {StoryModel} from "@/shared/business/stories";
import {stories, storyEntries} from "./database"

export {stories, storyEntries};
export const storyStorage = new ModelStorage<StoryModel>("story",)

export const storyRepository =
    createRepository<StoryModel, typeof stories.$inferSelect>(
        stories, storyEntries,
        storyStorage.loadModel.bind(storyStorage),
        storyStorage.saveModel.bind(storyStorage),
        storyStorage.bindSearch.bind(storyStorage),
    )

