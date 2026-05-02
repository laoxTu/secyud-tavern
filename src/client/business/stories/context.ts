import {createModelContextType, useModelContext} from "@/client/business/template/context";
import {StoryModel} from "@/shared/business/stories";

export const modelType = "story";
export const modelApi = "stories";
export const StoryContext = createModelContextType<StoryModel>();
export const useStoryContext = (t: any) =>
    useModelContext<StoryModel>(StoryContext, modelType, t)