'use client';
import { useTranslations } from 'next-intl';
import OpenAI from 'openai';
import React from 'react';
import { toast } from 'sonner';

import {
  Checkbox,
  Field,
  FieldContent,
  FieldLabel,
  Input,
  Selector,
} from '@/components';
import { utils } from '@/database';
import { forms } from '@/global';
import { BusinessError } from '@/interceptors';
import { TokenUsage } from '@/models';
import {
  ModelEngine,
  ModelInputSummary,
  models,
  useModelState,
} from '@/models/client';
import { DeepseekConfig, DeepseekOptions, deepseeks } from '@/models/deepseek';
import { openais } from '@/models/openai/client';
import { realms } from '@/stories/client/realms';
import { tools } from '@/tools/client';

function Content() {
  const t = useTranslations();
  const { item } = useModelState();
  if (!item) {
    throw new BusinessError('item is null. page should not be rendered.');
  }
  const options = utils.getProperty<DeepseekOptions>(
    item,
    models.names.options,
    () => deepseeks.default.options,
  );
  const config: DeepseekConfig = utils.getProperty(
    item,
    models.names.config,
    () => deepseeks.default.config,
  );
  const [thinking, setThinking] = React.useState<boolean>(
    options.thinking?.type === 'enabled',
  );
  return (
    <>
      <Field>
        <FieldLabel htmlFor={`model-token-limit`}>
          {t(`model.token_limit`)}
        </FieldLabel>
        <Input
          id={`model-token-limit`}
          name={'token_limit'}
          type={'number'}
          min={0}
          step={1}
          defaultValue={config.token}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={`model-model`}>{t(`model.model`)}</FieldLabel>
        <Selector
          name={'model'}
          id={`model-model`}
          value={options.model}
          items={deepseeks.models}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={`model-thinking`}>
          {t(`model.thinking`)}
        </FieldLabel>
        <FieldContent>
          <Checkbox
            id={`model-thinking`}
            name={'thinking'}
            checked={thinking}
            onCheckedChange={(e) => setThinking(e)}
          />
        </FieldContent>
      </Field>
      <Field>
        <FieldLabel htmlFor={`model-max_tokens`}>
          {t(`model.max_tokens`)}
        </FieldLabel>
        <Input
          id={`model-max_tokens`}
          name={'max_tokens'}
          type={'number'}
          min={0}
          step={1}
          defaultValue={options.max_tokens}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={`model-logprobs`}>
          {t(`model.logprobs`)}
        </FieldLabel>
        <FieldContent>
          <Checkbox
            id={`model-logprobs`}
            name={'logprobs'}
            defaultChecked={options.logprobs}
            disabled
          />
        </FieldContent>
      </Field>
      <Field>
        <FieldLabel htmlFor={`model-top_logprobs`}>
          {t(`model.top_logprobs`)}
        </FieldLabel>
        <Input
          id={`model-top_logprobs`}
          name={'top_logprobs'}
          type={'number'}
          max={20}
          min={0}
          step={0.1}
          disabled
          defaultValue={options.top_logprobs}
        />
      </Field>
      <Field className={thinking ? '' : 'hidden'}>
        <FieldLabel htmlFor={`model-reasoning_effort`}>
          {t(`model.reasoning_effort`)}
        </FieldLabel>
        <Selector
          name={'reasoning_effort'}
          id={`model-reasoning_effort`}
          value={options.reasoning_effort}
          items={deepseeks.reasoningEfforts}
        />
      </Field>
      <Field className={thinking ? 'hidden' : ''}>
        <FieldLabel htmlFor={`model-temperature`}>
          {t(`model.temperature`)}
        </FieldLabel>
        <Input
          id={`model-temperature`}
          name={'temperature'}
          type={'number'}
          max={2}
          min={0}
          step={0.05}
          defaultValue={options.temperature}
        />
      </Field>
      <Field className={thinking ? 'hidden' : ''}>
        <FieldLabel htmlFor={`model-top_p`}>{t(`model.top_p`)}</FieldLabel>
        <Input
          id={`model-top_p`}
          name={'top_p'}
          type={'number'}
          max={2}
          min={0}
          step={0.05}
          defaultValue={options.top_p}
        />
      </Field>
    </>
  );
}

export const engine: ModelEngine = {
  id: deepseeks.name,
  configComponent: Content,
  configureObject(data, model) {
    const options: DeepseekOptions = {
      model: forms.str(data, 'model'),
      thinking: {
        type: forms.bool(data, 'thinking') ? 'enabled' : 'disabled',
      },
      reasoning_effort: forms.str(data, 'reasoning_effort'),
      temperature: forms.float(data, 'temperature'),
      max_tokens: forms.int(data, 'max_tokens'),
      top_p: forms.float(data, 'top_p'),
      logprobs: forms.bool(data, 'logprobs'),
      top_logprobs: forms.float(data, 'top_logprobs'),
    };
    const config: DeepseekConfig = {
      token: forms.int(data, 'token_limit'),
    };
    utils.setProperty(model, models.names.config, config);
    utils.setProperty(model, models.names.options, options);
    return model;
  },
  async prompt(ctx) {
    const summaries: ModelInputSummary[] = [];
    const config = utils.getProperty<DeepseekConfig>(
      ctx.realm,
      models.names.config,
      () => deepseeks.default.config,
    );
    const options = utils.getProperty<DeepseekOptions>(
      ctx.realm,
      models.names.options,
      () => deepseeks.default.options,
    );

    const usage = utils.getProperty<TokenUsage>(
      realms.outputs(ctx.histories.at(-2))?.at(-1),
      'usage',
    );

    if (config.token && usage && config.token <= usage.prompt + usage.output) {
      toast.warning('token is over limit. use summary to compress', {
        richColors: true,
      });
    }
    const messages: OpenAI.ChatCompletionMessageParam[] = [];
    const { realm } = ctx;
    const pools: OpenAI.ChatCompletionTool[] = tools
      .actives(realm)
      .map((u) => ({
        type: 'function',
        function: {
          name: u.name,
          parameters: u.parameters as any,
          description: u.description,
        },
      }));
    await models.engines.prompt(ctx, {
      builder: realm.model.builder,
      name: (i) => `call_x${i}`,
      prompt: (content) => {
        summaries.push({ content, role: 'user' });
        messages.push({ role: 'user', content });
      },
      assist: (content, output) => {
        const extra =
          options.thinking.type === 'enabled'
            ? {
                reasoning_content: output
                  ? (output?.thought ?? '')
                  : 'user generated calling',
              }
            : {};
        summaries.push({ content, role: 'assistant' });
        messages.push({ role: 'assistant', content, ...extra });
      },
      system: (content) => {
        summaries.push({ content, role: 'system' });
        messages.push({ role: 'system', content });
      },
      caller: (content, output, callings) => {
        if (content) {
          summaries.push({ content, role: 'assistant' });
          messages.push({ role: 'assistant', content });
        }
        if (!callings.length) return;
        tools.summary(callings, summaries);
        const extra =
          options.thinking.type === 'enabled'
            ? {
                reasoning_content: output
                  ? (output?.thought ?? '')
                  : 'user generated calling',
              }
            : {};
        messages.push({
          role: 'assistant',
          content,
          tool_calls: callings.map((u) => ({
            id: u.id,
            type: 'function',
            function: {
              arguments: u.arguments,
              name: u.name,
            },
          })),
          ...extra,
        });
        for (const calling of callings) {
          messages.push({
            role: 'tool',
            tool_call_id: calling.id,
            content: calling.result ?? 'error',
          });
        }
      },
    });
    return {
      input: {
        messages,
        tools: pools.length ? pools : undefined,
      },
      summaries,
    };
  },
  result: openais.engine.result,
};
