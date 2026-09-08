import { OpenAI } from 'openai';

import { utils } from '@/database';
import { models } from '@/models';
import { DeepseekOptions, deepseeks } from '@/models/deepseek';
import { ModelEngine } from '@/models/server';

export const engine: ModelEngine = {
  id: deepseeks.name,
  async generate({ model, apiKey, signal, input }) {
    const options = utils.getProperty<DeepseekOptions>(
      model,
      models.names.options,
      () => deepseeks.default.options,
    );

    const client = new OpenAI({
      baseURL: 'https://api.deepseek.com',
      apiKey,
    });
    const parameter: OpenAI.ChatCompletionCreateParams = {
      ...options,
      ...input,
      stream: model.stream,
    };
    if (!options.logprobs) {
      parameter.top_logprobs = undefined;
    }
    if (!options.max_tokens) {
      parameter.max_tokens = undefined;
    }
    if (options.thinking.type === 'disabled') {
      parameter.reasoning_effort = undefined;
    }
    return await client.chat.completions.create(parameter, { signal });
  },
};
