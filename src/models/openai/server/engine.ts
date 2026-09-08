import { OpenAI } from 'openai';

import { utils } from '@/database';
import { models } from '@/models';
import { OpenAIConfig, OpenAIOptions, openais } from '@/models/openai';
import { ModelEngine } from '@/models/server';
import { jsonUtils } from '@/utils';

export const engine: ModelEngine = {
  id: openais.name,
  async generate({ model, apiKey, signal, input }) {
    const options = utils.getProperty<OpenAIOptions>(
      model,
      models.names.options,
      () => openais.default.options,
    );
    const config = utils.getProperty<OpenAIConfig>(
      model,
      models.names.config,
      () => openais.default.config,
    );

    const client = new OpenAI({
      baseURL: config.url,
      apiKey,
    });

    if (config.format === 'responses') {
      const parameter: OpenAI.Responses.ResponseCreateParams = {
        ...options,
        ...input,
        stream: model.stream,
        ...jsonUtils.parse(config.extras, {}),
      };
      return await client.responses.create(parameter, { signal });
    } else {
      const parameter: OpenAI.ChatCompletionCreateParams = {
        ...options,
        ...input,
        stream: model.stream,
      };
      return await client.chat.completions.create(parameter, { signal });
    }
  },
};
