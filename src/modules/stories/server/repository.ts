import {StoryModel} from "@/modules/stories/models";
import {createRepository} from "@/business/server/repository";
import {stories, storyEntries} from "@/modules/stories/server/db-entities";
import {storyStorage} from "@/modules/stories/server/storage";

export const storyRepository =
    createRepository<StoryModel, typeof stories.$inferSelect>(
        stories, storyEntries, storyStorage,
        (model) => ({
            requires: model.requires,
            llmapi: model.llmapi,
        }),
        (entity): Partial<StoryModel> => ({
            requires: entity.requires,
            llmapi: entity.llmapi,
        })
    )

