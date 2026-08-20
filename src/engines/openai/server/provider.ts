import {OpenAI} from "openai";
import {LlmapiProvider} from "@/modules/llmapis/server/provider-models";
import {engineName, OpenAIConfigModel} from "../models";
import {packSseStream} from "@/utils";

export const openAIProvider: LlmapiProvider = {
    id: engineName,
    async run(context, stream) {
        const config: OpenAIConfigModel = context.config;
        const client = new OpenAI({
            baseURL: config.url,
            apiKey: context.apiKey,
        });
        const parameter: OpenAI.ChatCompletionCreateParams = {
            ...context.config.parameters,
            ...context.input,
            stream,
        };

        const result =
            await client.chat.completions.create(
                parameter, {signal: context.signal,});
        return stream ? packSseStream(result as any) : result;
    }

}