import {createModelContextType, useModelContext} from "@/client/business/template/context";
import {StoryModel, name as modelType} from "@/shared/business/stories";

export const modelApi = "stories";
export const StoryContext = createModelContextType<StoryModel>();
export const useStoryContext = (t: any) =>
    useModelContext<StoryModel>(StoryContext, modelType, t)
