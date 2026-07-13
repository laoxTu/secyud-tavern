import {StoryModel} from "@/modules/stories/models";
import {createRepository} from "@/business/server/repository";
import {stories, storyEntries} from "@/modules/stories/server/db-entities";
import {storyStorage} from "@/modules/stories/server/storage";

export const storyRepository =
    createRepository<StoryModel, typeof stories.$inferSelect>(
        stories, storyEntries,
        storyStorage.loadModel.bind(storyStorage),
        storyStorage.saveModel.bind(storyStorage),
        storyStorage.bindSearch.bind(storyStorage),
        storyStorage.bindSorter.bind(storyStorage),
        (model) => ({
            requires: model.requires,
            llmapi: model.llmapi,
        }),
        (entity): Partial<StoryModel> => ({
            requires: entity.requires,
            llmapi: entity.llmapi,
        })
    )

