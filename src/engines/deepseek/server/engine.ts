import {OpenAI} from "openai";
import {LlmapiEngine, LlmapiRequestContext} from "@/llmapis/server/engine-models";
import {DeepseekConfigModel, engineName} from "../models";
import {generateOpenAIReadableStreamReply} from "@/engines/openai/server/engine";


export class DeepseekEngine implements LlmapiEngine {
    readonly id: string = engineName;

    async run(context: LlmapiRequestContext) {
        const config: DeepseekConfigModel = context.config;
        const openai = new OpenAI({
            baseURL: 'https://api.deepseek.com',
            apiKey: context.apiKey,
        });
        const parameter: any = {
            ...config.parameters,
            messages: context.messages.map(u => ({
                role: u.role,
                content: u.content,
            })),
        };
        if (!config.parameters.logprobs) {
            parameter.top_logprobs = undefined;
        }
        if (!config.parameters.max_tokens) {
            parameter.max_tokens = undefined;
        }

        if (config.parameters.thinking.type === "disabled")
        {
            parameter.reasoning_effort = undefined;
        }

        return await generateOpenAIReadableStreamReply(context, parameter, openai);
    }
}