import { useTranslations } from 'next-intl';
import OpenAI from 'openai';
import { useState } from 'react';

import {
  Field,
  FieldLabel,
  Input,
  rowHalf,
  Selector,
  spanHalf,
  submitTargetFormOnKey,
  Textarea,
} from '@/components';
import { utils } from '@/database';
import { BusinessError, checker } from '@/interceptors';
import { cn } from '@/lib/utils';
import {
  ModelEngine,
  ModelInputSummary,
  ModelPromptContext,
  ModelResultContext,
  models,
  useModelState,
} from '@/models/client';
import { ToolCall } from '@/tools';
import { tools } from '@/tools/client';
import { arrUtils } from '@/utils';

import { OpenAIConfig, OpenAIOptions, openais } from '..';

function Content() {
  const t = useTranslations();
  const { item } = useModelState();
  if (!item) {
    throw new BusinessError('item is null. page should not be rendered.');
  }
  const config: OpenAIConfig = utils.getProperty(
    item,
    models.names.config,
    () => openais.default.config,
  );
  const options: OpenAIOptions = utils.getProperty(
    item,
    models.names.options,
    () => openais.default.options,
  );
  const [format, setFormat] = useState<string | null>(config.format);

  return (
    <>
      <Field>
        <FieldLabel htmlFor={`openai-format`}>{t(`openai.format`)}</FieldLabel>
        <Selector
          id={`openai-format`}
          name={'format'}
          items={openais.formats}
          value={format}
          onValueChange={setFormat}
        />
      </Field>
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
      {format === 'responses' && (
        <>
          <Field>
            <FieldLabel htmlFor={`model-max_tokens`}>
              {t(`model.max_tokens`)}
            </FieldLabel>
            <Input
              id={`model-max_tokens`}
              name={'max_output_tokens'}
              type={'number'}
              min={0}
              step={1}
              defaultValue={options.max_output_tokens ?? 16}
            />
          </Field>
        </>
      )}
      <Field>
        <FieldLabel htmlFor={`model-presence_penalty`}>
          {t(`model.presence_penalty`)}
        </FieldLabel>
        <Input
          id={`model-presence_penalty`}
          name={'presence_penalty'}
          type={'number'}
          max={2}
          min={-2}
          step={0.05}
          defaultValue={options.presence_penalty}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={`model-frequency_penalty`}>
          {t(`model.frequency_penalty`)}
        </FieldLabel>
        <Input
          id={`model-frequency_penalty`}
          name={'frequency_penalty'}
          type={'number'}
          max={2}
          min={-2}
          step={0.05}
          defaultValue={options.frequency_penalty}
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

async function promptResponses(
  ctx: ModelPromptContext,
  items: ModelInputSummary[],
): Promise<any> {
  const messages: OpenAI.Responses.ResponseInputItem[] = [];
  const { realm } = ctx;
  const pools: OpenAI.Responses.Tool[] = tools.actives(realm).map((u) => ({
    type: 'function',
    name: u.name,
    parameters: u.parameters as any,
    description: u.description,
    strict: false,
  }));
  const systemPrompts: string[] = [];
  await models.engines.prompt(ctx, {
    builder: realm.model.builder,
    name: (i) => `call_x${i}`,
    prompt: (content) => {
      items.push({ content, role: 'user' });
      messages.push({ role: 'user', content });
    },
    assist: (content) => {
      items.push({ content, role: 'assistant' });
      messages.push({ role: 'assistant', content });
    },
    system: (content) => {
      systemPrompts.push(content);
    },
    caller: (content, _, callings) => {
      if (content) {
        items.push({ content, role: 'assistant' });
        messages.push({ role: 'assistant', content });
      }
      if (!callings.length) return;
      tools.summary(callings, items);
      for (const calling of callings) {
        messages.push({
          type: 'function_call',
          call_id: calling.id,
          arguments: calling.arguments,
          name: calling.name,
        });
      }
      for (const calling of callings) {
        messages.push({
          type: 'function_call_output',
          call_id: calling.id,
          output: calling.result ?? 'error',
        });
      }
    },
  });
  const instructions = arrUtils.join(systemPrompts, '\n');
  items.unshift({ content: instructions, role: 'system' });
  return {
    input: messages,
    instructions,
    tools: pools.length ? pools : undefined,
  };
}

async function promptChatCompletion(
  ctx: ModelPromptContext,
  items: ModelInputSummary[],
): Promise<any> {
  const messages: OpenAI.ChatCompletionMessageParam[] = [];
  const { realm } = ctx;
  const pools: OpenAI.ChatCompletionTool[] = tools.actives(realm).map((u) => ({
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
      items.push({ content, role: 'user' });
      messages.push({ role: 'user', content });
    },
    assist: (content) => {
      items.push({ content, role: 'assistant' });
      messages.push({ role: 'assistant', content });
    },
    system: (content) => {
      items.push({ content, role: 'system' });
      messages.push({ role: 'system', content });
    },
    caller: (content, _, callings) => {
      if (content) {
        items.push({ content, role: 'assistant' });
        messages.push({ role: 'assistant', content });
      }
      if (!callings.length) return;
      tools.summary(callings, items);
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
    messages,
    tools: pools.length ? pools : undefined,
  };
}

async function resultResponses(ctx: ModelResultContext) {
  ctx.properties ??= {};
  const { stream, message, output, properties } = ctx;

  if (stream) {
    const event: OpenAI.Responses.ResponseStreamEvent = message;
    switch (event.type) {
      case 'response.reasoning_summary_text.delta':
        output.thought += event.delta;
        break;
      case 'response.output_text.delta':
        properties.content ??= '';
        properties.content += event.delta;
        output.content = properties.content;
        break;
      // 新增 Item（消息或工具调用）
      case 'response.output_item.added':
        const item = event.item;
        if (item.type === 'function_call') {
          output.callings ??= [];
          properties.toolCallIndex ??= 0;
          properties.currentToolCall = {
            index: properties.toolCallIndex++,
            id: item.id,
            name: item.name,
            arguments: item.arguments ?? '',
          };
          output.callings.push(properties.currentToolCall);
        }
        break;
      case 'response.function_call_arguments.delta':
        if (properties.currentToolCall) {
          properties.currentToolCall.arguments += event.delta;
        }
        break;
      case 'response.completed':
        ctx.stopped = !output.callings?.length;
        break;
    }
  } else {
    const chunk: OpenAI.Responses.Response = message;
    if (chunk.output.every((u) => u.type !== 'function_call')) {
      ctx.stopped = true;
    }
    let toolCallId = 0;
    for (const delta of chunk.output) {
      switch (delta.type) {
        case 'function_call':
          {
            output.callings?.push({
              index: toolCallId++,
              id: delta.call_id,
              name: delta.name,
              arguments: delta.arguments ?? '',
            });
          }
          break;
        case 'message':
          output.content = arrUtils.join(
            delta.content.filter((u) => u.type === 'output_text'),
            '',
            (u) => u.text,
          );
          break;
        case 'reasoning':
          if (delta.content) {
            output.thought += arrUtils.join(delta.content, '', (u) => u.text);
          }
          break;
      }
    }
  }
}

async function resultChatCompletion(ctx: ModelResultContext) {
  ctx.properties ??= {};
  const { stream, message, output, properties } = ctx;
  if (stream) {
    const chunk: OpenAI.ChatCompletionChunk = message;
    const choice = chunk.choices[0];
    const delta = choice.delta;
    if (choice.finish_reason === 'stop') {
      ctx.stopped = true;
    }
    // 偷懒，deepseek的思考直接放这里了
    const thought: string = (delta as any).reasoning_content;
    output.thought += thought ?? '';
    if (delta.content) {
      properties.content ??= '';
      properties.content += delta.content;
      output.content = properties.content;
    }
    // 流式 tool_calls 分片到达，按 index 归并，arguments 逐段拼接。
    if (delta.tool_calls?.length) {
      output.callings ??= [];
      for (const tool_call of delta.tool_calls) {
        const index = output.callings.findIndex(
          (u) => u.index === tool_call.index,
        );
        let calling: ToolCall = null!;
        if (index < 0) {
          calling = {
            index: tool_call.index,
            id: tool_call.id!,
            name: tool_call.function!.name!,
            arguments: tool_call.function?.arguments ?? '',
          };
          output.callings.push(calling);
        } else {
          calling = output.callings[index];
        }
        calling.id ??= tool_call.id ?? '';
        calling.name ??= tool_call.function?.name ?? '';
        if (tool_call.function?.arguments)
          calling.arguments += tool_call.function.arguments;
      }
    }
  } else {
    const chunk: OpenAI.ChatCompletion = message;
    const choice = chunk.choices[0];
    const delta = choice.message;
    if (choice.finish_reason === 'stop') {
      ctx.stopped = true;
    }
    const thought: string = (delta as any).reasoning_content;
    output.thought += thought ?? '';
    output.content = delta.content ?? '';
    if (delta.tool_calls)
      for (let i = 0; i < delta.tool_calls.length; i++) {
        const tool_call = delta.tool_calls[i];
        if (tool_call.type === 'function') {
          output.callings?.push({
            index: i,
            id: tool_call.id,
            name: tool_call.function?.name,
            arguments: tool_call.function?.arguments ?? '',
          });
        }
      }
  }
}

export const engine: ModelEngine = {
  id: openais.name,
  configComponent: Content,
  configureObject(data, model) {
    const options: OpenAIOptions = {
      model: data.get('model') as string,
      temperature: Number(data.get('temperature')),
      top_p: Number(data.get('top_p')),
      presence_penalty: Number(data.get('presence_penalty')),
      frequency_penalty: Number(data.get('frequency_penalty')),
      max_output_tokens: Number(data.get('max_output_tokens')),
    };
    const config: OpenAIConfig = {
      extras: checker.validJson(data.get('extras') as string, 'openai.extras'),
      url: data.get('url') as string,
      format: data.get('format') as any,
    };
    utils.setProperty(model, models.names.config, config);
    utils.setProperty(model, models.names.options, options);
    return model;
  },
  /**
   * Open AI 有两个格式, chat 和 responses
   * 这里用两个方法
   */
  async prompt(ctx) {
    const summaries: ModelInputSummary[] = [];
    const config = utils.getProperty<OpenAIConfig>(
      ctx.realm,
      models.names.config,
      () => openais.default.config,
    );
    const input =
      config.format === 'responses'
        ? await promptResponses(ctx, summaries)
        : await promptChatCompletion(ctx, summaries);
    return {
      input,
      summaries,
    };
  },
  async result(ctx: ModelResultContext) {
    if (!ctx.output) return;
    const config = utils.getProperty<OpenAIConfig>(
      ctx.realm,
      models.names.config,
      () => openais.default.config,
    );
    if (config.format === 'responses') {
      await resultResponses(ctx);
    } else {
      await resultChatCompletion(ctx);
    }
  },
};
