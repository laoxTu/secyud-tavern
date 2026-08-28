import {LlmapiProvider} from "@/modules/llmapis/server/provider-models";
import {AnthropicConfigModel, engineName} from "../models";
import Anthropic from '@anthropic-ai/sdk';

export const anthropicProvider: LlmapiProvider = {
    id: engineName,
    async run(context, stream) {
        const config: AnthropicConfigModel = context.config;
        const anthropic = new Anthropic({
            baseURL: config.url,
            apiKey: context.apiKey,
        });
        const parameter = {
            ...context.config.parameters,
            ...context.input,
            stream
        };
        return await anthropic.messages.create(
            parameter, {signal: context.signal}) as any;
    }

}