import { Anthropic } from '@anthropic-ai/sdk';

import { utils } from '@/database';
import { models } from '@/models';
import { ModelEngine } from '@/models/server';
import { jsonUtils } from '@/utils';

import { AnthropicConfig, AnthropicOptions, anthropics } from '..';

export const engine: ModelEngine = {
  id: anthropics.name,
  async generate({ model, apiKey, signal, input }) {
    const options = utils.getProperty<AnthropicOptions>(
      model,
      models.names.options,
      () => anthropics.default.options,
    );
    const config = utils.getProperty<AnthropicConfig>(
      model,
      models.names.config,
      () => anthropics.default.config,
    );

    const anthropic = new Anthropic({
      baseURL: config.url,
      apiKey,
    });
    const parameter = {
      ...options,
      ...input,
      stream: model.stream,
      ...jsonUtils.parse(config.extras, {}),
    };
    return (await anthropic.messages.create(parameter, { signal })) as any;
  },
};
