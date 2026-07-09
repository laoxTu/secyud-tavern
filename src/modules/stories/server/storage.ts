import {ModelStorage} from "@/business/server/storage";
import {StoryModel, moduleName} from "../models";

export const storyStorage = ModelStorage.getInstance<StoryModel>(moduleName,)