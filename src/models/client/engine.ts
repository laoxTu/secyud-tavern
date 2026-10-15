'use client';
import React from 'react';

import { getRegistry, Registerable } from '@/global';
import { Model } from '@/models';
import {
  ModelPromptContext,
  ModelResultContext,
  models,
} from '@/models/client';
import { RealmHistory, RealmOutput, RealmSpace } from '@/stories';
import { realms } from '@/stories/realms/client';
import { ToolCall } from '@/tools';
import { tools } from '@/tools/client';
import { invokeCompose } from '@/utils';

export interface ModelInjectContext {
  /**
   * 由索引生成调用名，各个模型可能不一样
   */
  name: (index: number) => string;
  /**
   * 生成类型，冗余字段，顺便传递
   */
  builder: string;
  /**
   * 用户输入
   */
  prompt: (content: string) => void;
  /**
   * ai输出
   * 也可能是模拟ai输出
   * 所以output可选
   */
  assist: (content: string, output: RealmOutput | null) => void;
  /**
   * 工具调用
   */
  caller: (
    content: string,
    output: RealmOutput | null,
    callings: ToolCall[],
  ) => void;
  /**
   * 系统提示词
   */
  system: (content: string) => void;
}

/**
 * 在每条消息注入时进行额外操作
 * index: 当前历史的索引
 */
export interface InjectMessage {
  /**
   * 注入用户输入时的操作
   * @param history
   * @param next 下一个操作
   * @returns
   */
  prompt?: (history: RealmHistory, next: () => Promise<void>) => Promise<void>;
  /**
   * 注入输出时的操作
   * @param history
   * @param output
   * @param next 下一个操作
   * @returns
   */
  output?: (
    history: RealmHistory,
    output: RealmOutput,
    next: () => Promise<void>,
  ) => Promise<void>;
  /**
   * 注入空间时的操作
   * @param history
   * @param next 下一个操作
   * @returns
   */
  spaces?: (
    history: RealmHistory,
    space: RealmSpace,
    next: () => Promise<void>,
  ) => Promise<void>;
}

export type InjectHandler = (ctx: ModelInjectContext) => Promise<InjectMessage>;

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
  /**
   * 从引擎生成提示词，由各个模型调用
   * @param param0
   * @param ctx
   */
  async prompt(
    { realm, histories, converts, injects, controller }: ModelPromptContext,
    ctx: ModelInjectContext,
  ) {
    const { prompt, assist, caller } = ctx;
    const handlers = await Promise.all(injects.map((u) => u(ctx)));
    console.debug(`[input-builder](histories): `, histories);
    for (let i = 0; i < histories.length; i++) {
      const history = histories[i];

      await invokeCompose(
        handlers
          .filter((u) => u.prompt)
          .map((u) => (next) => u.prompt!(history, next)),
        async () => {
          if (!history.content) return;
          const content = await models.convert(converts, history.content, {
            role: 'user',
            type: 'input',
            history,
          });
          if (content) prompt(content);
        },
      );

      const space = realms.space(history)!;

      for (const output of space.outputs) {
        await invokeCompose(
          handlers
            .filter((u) => u.output)
            .map((u) => (next) => u.output!(history, output, next)),
          async () => {
            const content = await models.convert(converts, output.content, {
              role: 'assistant',
              type: 'output',
              history,
            });
            // 检验工具是否触发
            await tools.calling(realm, history, controller, output.callings);
            if (output.callings?.length) {
              caller(content, output, output.callings);
            } else if (content) {
              assist(content, output);
            }
          },
        );
      }

      await invokeCompose(
        handlers
          .filter((u) => u.spaces)
          .map((u) => (next) => u.spaces!(history, space, next)),
        async () => {},
      );
    }
  },
};
