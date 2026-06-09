import {createModelContextType, useModelContext} from "@/components/template/models";
import {moduleName, StoryModel} from "../models";

export const StoryContext = createModelContextType<StoryModel>();
export const useStoryContext = (t: any) =>
    useModelContext<StoryModel>(StoryContext, moduleName, t)
