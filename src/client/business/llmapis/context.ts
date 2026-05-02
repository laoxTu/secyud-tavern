import {createModelContextType, useModelContext} from "@/client/business/template/context";
import {LlmapiModel} from "@/shared/business/llmapis";

export const modelType = "llmapi";
export const modelApi = "llmapis";
export const LlmapiContext = createModelContextType<LlmapiModel>();
export const useLlmapiContext = (t: any) =>
    useModelContext<LlmapiModel>(LlmapiContext, modelType, t)