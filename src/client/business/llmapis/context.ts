import {createModelContextType, useModelContext} from "@/client/business/template/context";
import {LlmapiModel, name as modelType} from "@/shared/business/llmapis";

export const modelApi = "llmapis";
export const LlmapiContext = createModelContextType<LlmapiModel>();
export const useLlmapiContext = (t: any) =>
    useModelContext<LlmapiModel>(LlmapiContext, modelType, t)