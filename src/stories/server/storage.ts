import {ModelStorage} from "@/business/server/storage";
import {StoryModel, moduleName} from "../models";

export const storyStorage = new ModelStorage<StoryModel>(moduleName,)