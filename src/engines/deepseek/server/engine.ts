import {OpenAI} from "openai";
import {LlmapiEngine, LlmapiRequestContext} from "@/modules/llmapis/server/engine-models";
import {DeepseekConfigModel, engineName} from "../models";
import {generateOpenAIReadableStreamReply, mapToOpenAIMessage} from "@/engines/openai/server/engine";


export class DeepseekEngine implements LlmapiEngine {
    readonly id: string = engineName;

    async run(context: LlmapiRequestContext) {
        const config: DeepseekConfigModel = context.config;
        const openai = new OpenAI({
            baseURL: 'https://api.deepseek.com',
            apiKey: context.apiKey,
        });
        const parameter = mapToOpenAIMessage(context);

        if (!config.parameters.logprobs) {
            parameter.top_logprobs = undefined;
        }
        if (!config.parameters.max_tokens) {
            parameter.max_tokens = undefined;
        }
        if (config.parameters.thinking.type === "disabled") {
            parameter.reasoning_effort = undefined;
        }

        return await generateOpenAIReadableStreamReply(context, parameter, openai);
    }
}