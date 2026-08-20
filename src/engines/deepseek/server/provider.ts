import {OpenAI} from "openai";
import {LlmapiProvider} from "@/modules/llmapis/server/provider-models";
import {DeepseekConfigModel, engineName} from "../models";
import {packSseStream} from "@/utils";

export const deepseekProvider: LlmapiProvider = {
    id: engineName,

    async run(context, stream) {
        const config: DeepseekConfigModel = context.config;
        const client = new OpenAI({
            baseURL: 'https://api.deepseek.com',
            apiKey: context.apiKey,
        });
        const parameter: OpenAI.ChatCompletionCreateParams = {
            ...context.config.parameters,
            ...context.input,
            stream,
        };
        if (!config.parameters.logprobs) {
            parameter.top_logprobs = undefined;
        }
        if (!config.parameters.max_tokens) {
            parameter.max_tokens = undefined;
        }
        if (config.parameters.thinking.type === "disabled") {
            parameter.reasoning_effort = undefined;
        }
        const result =
            await client.chat.completions.create(
                parameter, {signal: context.signal,});
        return stream ? packSseStream(result as any) : result;
    }
}