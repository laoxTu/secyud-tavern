import {ModelStorage} from "@/business/server/storage";
import {StoryModel} from "@/stories/models";

export const storyStorage = new ModelStorage<StoryModel>("story",)