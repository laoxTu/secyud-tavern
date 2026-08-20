import {ModelStorage} from "@/business/server/storage";
import {moduleName, StoryModel} from "../models";

export const storyStorage = ModelStorage.getInstance<StoryModel>(moduleName,)