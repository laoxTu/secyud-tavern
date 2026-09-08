import { Anthropic } from '@anthropic-ai/sdk';
import { useTranslations } from 'next-intl';
import React from 'react';

import {
  Field,
  FieldLabel,
  Input,
  rowHalf,
  spanHalf,
  submitTargetFormOnKey,
  Textarea,
} from '@/components';
import { utils } from '@/database';
import { BusinessError, checker } from '@/interceptors';
import { cn } from '@/lib/utils';
import { ModelEngine, ModelInputSummary, models } from '@/models/client';
import { useModelState } from '@/models/client/state';
import { realms } from '@/stories/client/realms';
import { tools } from '@/tools/client';
import { arrUtils, jsonUtils } from '@/utils';

import { AnthropicConfig, AnthropicOptions, anthropics } from '..';

function Content() {
  const t = useTranslations();
  const { item } = useModelState();
  if (!item) {
    throw new BusinessError('item is null. page should not be rendered.');
  }
  const config: AnthropicConfig = utils.getProperty(
    item,
    models.names.config,
    () => anthropics.default.config,
  );
  const options: AnthropicOptions = utils.getProperty(
    item,
    models.names.options,
    () => anthropics.default.options,
  );

  return (
    <>
      <Field>
        <FieldLabel htmlFor={`model-url`}>{t(`model.url`)}</FieldLabel>
        <Input id={`model-url`} name={'url'} defaultValue={config.url} />
      </Field>
      <Field>
        <FieldLabel htmlFor={`model-model`}>{t(`model.model`)}</FieldLabel>
        <Input id={`model-model`} name={'model'} defaultValue={options.model} />
      </Field>
      <Field>
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
      <Field>
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
      <Field>
        <FieldLabel htmlFor={`model-max_tokens`}>
          {t(`model.max_tokens`)}
        </FieldLabel>
        <Input
          id={`model-max_tokens`}
          name={'max_tokens'}
          type={'number'}
          min={1}
          step={1}
          defaultValue={options.max_tokens}
        />
      </Field>
      <Field className={cn(spanHalf, rowHalf)}>
        <FieldLabel htmlFor={`model-extras`}>{t(`model.extras`)}</FieldLabel>
        <Textarea
          id={`model-extras`}
          name={'extras'}
          defaultValue={JSON.stringify(config.extras)}
          onKeyDown={submitTargetFormOnKey}
        />
      </Field>
    </>
  );
}

export const engine: ModelEngine = {
  id: anthropics.name,
  configComponent: Content,
  configureObject(data, model) {
    const options: AnthropicOptions = {
      model: data.get('model') as string,
      temperature: Number(data.get('temperature')),
      top_p: Number(data.get('top_p')),
      max_tokens: Number(data.get('max_tokens')),
    };
    const config: AnthropicConfig = {
      extras: checker.validJson(
        data.get('extras') as string,
        'anthropic.extras',
      ),
      url: data.get('url') as string,
    };
    utils.setProperty(model, models.names.config, config);
    utils.setProperty(model, models.names.options, options);
    return model;
  },
  /**
   *
   */
  async prompt(ctx) {
    const { realm } = ctx;
    const summaries: ModelInputSummary[] = [];
    const messages: Anthropic.MessageParam[] = [];
    const pools: Anthropic.ToolUnion[] = tools.actives(realm).map((u) => ({
      name: u.name,
      input_schema: u.parameters as any,
      description: u.description,
    }));
    pools.push({
      input_schema: models.engines.knowledge.schema as any,
      ...models.engines.knowledge.info,
    });
    const systemPrompts: string[] = [];
    await models.engines.prompt(ctx, {
      builder: realm.model.builder,
      name: (i) => `call_x${i}`,
      prompt: (content) => {
        summaries.push({ content, role: 'user' });
        messages.push({ role: 'user', content });
      },
      assist: (content, output) => {
        summaries.push({ content, role: 'assistant' });
        const message: Anthropic.MessageParam = output?.properties?.[
          'signature'
        ]
          ? {
              role: 'assistant',
              content: [
                { type: 'text', text: content },
                {
                  type: 'thinking',
                  thinking: output.thought,
                  signature: output.properties['signature'],
                },
              ],
            }
          : { role: 'assistant', content };
        messages.push(message);
      },
      system: (content) => {
        systemPrompts.push(content);
      },
      caller: (content, output, callings) => {
        const aiParams: Anthropic.ContentBlockParam[] = [];
        // 即便没有工具调用，思考和ai回复也要注入
        messages.push({ role: 'assistant', content: aiParams });
        if (content) {
          summaries.push({ content, role: 'assistant' });
          aiParams.push({ type: 'text', text: content });
        }
        if (output?.properties?.['signature']) {
          aiParams.push({
            type: 'thinking',
            thinking: output.thought,
            signature: output.properties['signature'],
          });
        }
        if (!callings.length) return;
        tools.summary(callings, summaries);
        const userParams: Anthropic.ContentBlockParam[] = [];
        for (const calling of callings) {
          aiParams.push({
            type: 'tool_use',
            id: calling.id,
            name: calling.name,
            input: jsonUtils.parse(calling.arguments),
          });
          userParams.push({
            type: 'tool_result',
            tool_use_id: calling.id,
            content: calling.result ?? 'error',
          });
        }
        messages.push({
          role: 'user',
          content: userParams,
        });
      },
    });
    const system = arrUtils.join(systemPrompts, '\n');
    summaries.unshift({ content: system, role: 'system' });

    const input: Partial<Anthropic.MessageCreateParams> = {
      system,
      messages,
      tools: pools.length > 0 ? pools : undefined,
    };
    return {
      input,
      summaries,
    };
  },
  async result(ctx) {
    ctx.properties ??= {};
    const { output, properties, message, stream } = ctx;
    if (!message) return;
    if (stream) {
      const chunk: Anthropic.RawMessageStreamEvent = message;
      if (
        chunk.type === 'message_delta' &&
        chunk.delta.stop_reason === 'end_turn'
      ) {
        ctx.stopped = true;
      }

      if (chunk.type === 'content_block_start') {
        if (chunk.content_block.type === 'tool_use') {
          const delta = chunk.content_block;
          output.callings ??= [];
          output.callings.push({
            index: output.callings.length,
            id: delta.id,
            name: delta.name,
            arguments: '',
          });
        }
      } else if (chunk.type === 'content_block_delta') {
        const delta = chunk.delta;

        switch (delta.type) {
          case 'text_delta':
            properties.content ??= '';
            properties.content += delta.text;
            realms.fill(output, properties.content);
            break;
          case 'signature_delta':
            output.properties ??= {};
            output.properties['signature'] += delta.signature;
            break;
          case 'thinking_delta':
            output.thought += delta.thinking;
            break;
          case 'input_json_delta':
            if (output.callings?.length) {
              const calling = output.callings.at(-1)!;
              calling.arguments += delta.partial_json;
            }
            break;
        }
      }
    } else {
      const chunk: Anthropic.Message = message;
      if (chunk.stop_reason === 'end_turn') {
        ctx.stopped = true;
      }
      let toolIndex = 0;
      for (const delta of chunk.content) {
        switch (delta.type) {
          case 'text':
            output.content += delta.text;
            break;
          case 'thinking':
            output.thought += delta.thinking;
            output.properties ??= {};
            output.properties['signature'] = delta.signature;
            break;
          case 'tool_use':
            output.callings ??= [];
            output.callings.push({
              index: toolIndex++,
              id: delta.id,
              name: delta.name,
              arguments: JSON.stringify(delta.input ?? {}),
            });
            break;
        }
      }
    }
  },
};
