'use client';
import React from 'react';

import { Model } from '@/models';
import {
  ModelInjectContext,
  ModelPromptContext,
  ModelResultContext,
  models,
} from '@/models/client';
import { getRegistry, Registerable } from '@/plugins';
import { RealmHistory } from '@/stories';
import { realms } from '@/stories/client/realms';
import { tools } from '@/tools/client';
import { arrUtils } from '@/utils';

/**
 * 摘要，用于展示
 */
export interface ModelInputSummary {
  role: string;
  content: string;
}

/**
 * 由消息输入转换而来
 * 是模型部分的输入
 */
export interface ModelInput {
  input: any;
  summaries: ModelInputSummary[];
}

/**
 * 前端模型引擎，用于配置，整理输入输出
 */
export interface ModelEngine extends Registerable {
  /**
   * 配置组件
   */
  configComponent: React.ComponentType;
  /**
   * 根据组件表单填充配置对象
   */
  configureObject: (data: FormData, model: Partial<Model>) => Partial<Model>;
  /**
   * 处理输出
   */
  result: (ctx: ModelResultContext) => Promise<void>;
  /**
   * 处理前面所有轮次的输入
   */
  prompt: (ctx: ModelPromptContext) => Promise<ModelInput>;
}

const registry = getRegistry<ModelEngine>('model-engine');

export const engines = {
  knowledge: {
    info: {
      name: 'get_knowledge',
      description:
        'get knowledge. return empty if current knowledge is injected. ',
    },
    schema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          description: 'the type of knowledge. ',
        },
      },
    },
    args: (args: { type: string }) => JSON.stringify(args),
  },
  registry,
  async prompt(
    { realm, histories, converts, injects, current }: ModelPromptContext,
    ctx: ModelInjectContext,
  ) {
    const { prompt, assist, caller } = ctx;
    const handlers = await Promise.all(injects.map((u) => u(ctx)));
    console.debug(`[input-builder](histories): `, histories);
    for (let i = 0; i < histories.length; i++) {
      const history = histories[i];

      for (const handler of handlers) {
        await handler.before?.(i);
      }

      await generateInput(history);

      for (const handler of handlers) {
        await handler.middle?.(i);
      }

      if (i < histories.length - 1 || current) await generateOutputs(history);

      for (const handler of handlers) {
        await handler.behind?.(i);
      }
    }

    async function generateOutputs(history: RealmHistory) {
      const outputs = realms.outputs(history);
      if (!outputs) return;
      for (const output of outputs) {
        const content = await generateContent(
          output.content,
          'assistant',
          'output',
        );
        // 检验工具是否触发
        await tools.calling(realm, output.callings);
        if (output.callings?.length) {
          caller(content, output, output.callings);
        } else if (content) {
          assist(content, output);
        }
      }
    }

    async function generateInput(history: RealmHistory) {
      if (!history.prompts.length) return;
      const input = arrUtils.join(history.prompts, '\n', (u) => u.content);
      const content = await generateContent(input, 'user', 'input');
      if (content) prompt(content);
    }

    async function generateContent(str: string, role: string, type: string) {
      return await models.convert(converts, { str, role, type });
    }
  },
};
