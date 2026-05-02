import {createRepository} from "@/server/business/repository-base";
import {ModelStorage} from "@/server/business/model-storage";
import {StoryModel} from "@/shared/business/stories";
import {stories, storyEntries} from "./database"
import {PresetModel} from "@/shared/business/presets";

export {stories, storyEntries};
export const storyStorage = new ModelStorage<StoryModel>("story",)

export const storyRepository =
    createRepository<StoryModel, typeof stories.$inferSelect>(
        stories, storyEntries,
        storyStorage.loadModel.bind(storyStorage),
        storyStorage.saveModel.bind(storyStorage),
        storyStorage.bindSearch.bind(storyStorage),
        (model) => ({
            requires: model.requires,
        }),
        (entity): Partial<PresetModel> => ({
            requires: entity.requires,
        })
    )

