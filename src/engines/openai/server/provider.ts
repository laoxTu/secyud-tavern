import {OpenAI} from "openai";
import {LlmapiProvider} from "@/modules/llmapis/server/provider-models";
import {engineName, OpenAIConfigModel} from "../models";

export const openAIProvider: LlmapiProvider = {
    id: engineName,
    async run(context, stream) {
        const config: OpenAIConfigModel = context.config;
        const client = new OpenAI({
            baseURL: config.url,
            apiKey: context.apiKey,
        });

        if (config.format === "responses") {
            const parameter: OpenAI.Responses.ResponseCreateParams = {
                ...context.config.parameters,
                ...context.input,
                stream,
            };
            return await client.responses.create(
                parameter, {signal: context.signal,});
        } else {
            const parameter: OpenAI.ChatCompletionCreateParams = {
                ...context.config.parameters,
                ...context.input,
                stream,
            };
            return await client.chat.completions.create(
                parameter, {signal: context.signal,});
        }
    }

}