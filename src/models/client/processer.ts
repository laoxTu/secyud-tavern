import { BusinessError } from '@/interceptors';
import { isAbortError, isNetworkError } from '@/interceptors/client';
import { getRegistry, Registerable } from '@/plugins';
import { SignalBinder, signals, sseUtils } from '@/signal';
import { realms, useRealmState } from '@/stories/client/realms';
import {
  Realm,
  RealmContext,
  RealmHistory,
  RealmOutput,
} from '@/stories/realms';
import { ToolCall } from '@/tools';

import { Model } from '..';

import { engines } from './engine';

import { ConvertContent, models, useModelSettingState } from '.';

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
 * before: 在user注入前操作
 * middle: 在user和ai注入间操作
 * behind: 在ai注入后操作
 */
export interface InjectMessage {
  before?: (index: number) => Promise<void>;
  middle?: (index: number) => Promise<void>;
  behind?: (index: number) => Promise<void>;
}

export type InjectHandler = (ctx: ModelInjectContext) => Promise<InjectMessage>;

export interface ModelInitContext extends RealmContext {
  id?: string;
}

export interface ModelPromptContext extends RealmContext {
  /**
   * 这个和保存的有细微的差别
   * 是从最后一个总结段落开始
   * 开场白也视为一个总结段落
   */
  histories: RealmHistory[];
  /**
   * 当前历史，应为新创建的
   */
  history: RealmHistory;
  /**
   * 当前输出是否为后续
   * 即并非重新开始生成
   * 而是一个轮次的后续
   */
  current: boolean;
  converts: ConvertContent[];
  injects: InjectHandler[];
}

/**
 * 这个是用于所有输出结束后统一调用
 */
export interface ModelOutputContext extends RealmContext {
  history: RealmHistory;
}

/**
 * 这个是为了让engine将输出设置为标准格式
 */
export interface ModelResultContext extends RealmContext {
  output: RealmOutput;
  message: any;
  stream: boolean;
  stopped: boolean;
}

/**
 * 执行模型流程
 */
export interface Processer<T = any> extends Registerable {
  init: (ctx: ModelInitContext) => Promise<T>;
  /**
   * 处理提示词，更新输入历史
   */
  prompt?: (ctx: ModelPromptContext, cache: T) => Promise<void>;
  /**
   * 处理输出信息，更新输出属性
   */
  output?: (ctx: ModelOutputContext, cache: T) => Promise<void>;
}

const registry = getRegistry<Processer>('model-processer');

function modelInfo(model: Model) {
  // 工具循环：输出还带 toolCalls 就续接当前输出再请求，直到模型不再调工具。
  const engineName = model.engine;
  if (!engineName) {
    throw new BusinessError(
      `[realm](input): llmapi engine is not set. (${model.name})`,
    );
  }
  const engine = engines.registry.records[engineName];
  if (!engine) {
    throw new BusinessError(
      `[realm](input): llmapi provider is not registered. (${engineName})`,
    );
  }
  return {
    model,
    engine,
    iterations: Math.max(2, model.iterations ?? 20),
  };
}

async function prompt({
  realm,
  args,
  current,
}: {
  realm: Realm;
  args?: any;
  current: boolean;
}) {
  const { engine } = modelInfo(realm.model);
  const histories: RealmHistory[] = [];
  for (let i = realm.histories.length; i > 0; i--) {
    const history = await realms.history.get(i, realm);
    histories.push(history);
    if (history.summary) break;
    if (i === 1) {
      histories.push(realms.opening(realm));
    }
  }
  histories.reverse();
  console.debug('[realm](histories): ', histories);

  const context: ModelPromptContext = {
    realm,
    properties: { args },
    current,
    history: histories.at(-1)!,
    histories,
    converts: [],
    injects: [],
  };

  console.debug('[realm](input): ', context);

  await registry.use(async (p) => {
    await p.prompt?.(context, models.cache(realm, p.id));
  });
  return await engine.prompt(context);
}

export const processers = {
  registry,
  async initialize({ realm }: { realm: Realm }) {
    const context: ModelInitContext = {
      properties: {},
      realm,
    };
    await registry.use(async (p) => {
      const cache = await p.init(context);
      realms.initContext(realm, models.key(p.id), cache);
    });
  },
  async output({ realm }: { realm: Realm }) {
    const outputContext: ModelOutputContext = {
      properties: {},
      realm,
      history: realm.histories.at(-1)!,
    };
    // 解析输出，填充一些选项或处理，这里应该会缓存世界书
    await registry.use(async (p) => {
      await p.output?.(outputContext, models.cache(realm, p.id));
    });
  },
  prompt,
  /**
   * 这个函数包含了生成的流程规则，非常复杂，包含重试机制，
   * 流式和非流式判断等。
   */
  async *generate({
    args,
    signal,
    realm,
  }: {
    args?: any;
    signal: SignalBinder;
    realm: Realm;
  }) {
    const { engine, model, iterations } = modelInfo(realm.model);
    const setting = useModelSettingState.getState();
    // 重试最大次数，小于0其实不碍事，但是显示不好看
    const maxRetry = Math.max(0, setting.retry);
    // 注意单位换算为毫秒，最低一秒，最高10秒
    const interval = Math.min(Math.max(setting.interval, 1), 10) * 1000;
    /**
     * 先准备输出组，注意一轮对话不止有一个输出
     * ai的一次请求可能会输出工具调用，调用
     * 的结果需要返回给ai继续进行调用，除非
     * ai明确返回stop。
     * 这里也取设定中的最大迭代次数，做了一个
     * 限制
     */
    const outputs: RealmOutput[] = [];
    const history = await realms.history.get(null, realm);
    history.output = history.outputs.length;
    history.outputs.push(outputs);

    let iteration = iterations;
    // 剩余轮次限制
    while (iteration > 0) {
      iteration--;
      console.debug(`[realm]: iterations ${iteration}`);
      const current = outputs.length > 0;
      /**
       * 构造输入上下文，这里的输入上下文应当包含本次的工具调用
       */
      useRealmState.getState().setRealmInfo({
        title: 'story.input_processing',
        content: '',
      });
      const { input } = await prompt({ args, current, realm });

      /**
       * 准备单次输出
       */
      const output: RealmOutput = {
        content: '',
        thought: '',
        variables: [],
        properties: {},
      };
      outputs.push(output);

      // 输出的属性缓存
      const properties: Record<string, any> = {};
      // 预备生成函数，以复用
      const generate = async (stream: boolean, delta: any) => {
        const context: ModelResultContext = {
          properties,
          output,
          /**
           * stream是后端的真实输出，
           * 这里传入防止中途修改。
           * 理论上与配置一样
           */
          stream,
          realm,
          message: delta,
          // 初始值为false，解析后可能会变成true
          stopped: false,
        };
        await engine.result(context);
        if (context.stopped) {
          iteration = 0;
        }
        return { outputs, output };
      };

      /**
       * 设置信号，当外部中断，如用户取消输出时，
       * 应当中断请求，并将iteration设置为0，
       * 以退出ai的整体回复
       */
      const reply = new AbortController();
      await signal(reply);
      signals.setAbort(reply.signal, () => {
        console.debug('[realm]: reset signal');
        iteration = 0;
      });
      /**
       * 如果网络错误或者中间间隔太长，可以重试
       */
      let retry = maxRetry;
      while (retry > 0) {
        /**
         * 这是内部关联信号，因为和外部信号有
         * 轮次差异，使用关联的方式而不是复用
         * 外部信号
         */
        const controller = new AbortController();
        signals.setAbort(reply.signal, (event) => {
          controller.abort((event.target as AbortSignal)?.reason);
        });
        /**
         * 这是重试信号的标记，如果已经结束了
         * 就不用再检查是否需要重试了
         */
        let finished = false;
        try {
          if (realm.model.stream) {
            /**
             * 通过时间对比进行判断
             * 最新输出时间和当前时间
             * 差值超过setting.interval s，
             * 则提出重试中断后会自动重试
             */
            let updateTime = new Date();
            const checkTime = () => {
              setTimeout(() => {
                if (finished) return;
                const elapsed = Date.now() - updateTime.getTime();
                if (elapsed > interval) {
                  controller.abort('retry');
                } else if (!finished) {
                  checkTime();
                }
              }, interval / 2);
            };
            const response = await models.proxy.engine.generate(
              model.id,
              input,
              controller.signal,
            );

            /**
             * 流式请求可能会中途卡住
             * 卡住超过一秒就重新请求
             * 这个属于用户体验方面
             */
            checkTime();

            if (response.body) {
              for await (const chunk of sseUtils.read(response.body)) {
                updateTime = new Date();
                yield generate(true, chunk);
              }
            }
          } else {
            const response = await models.proxy.engine.generate(
              model.id,
              input,
              reply.signal,
            );

            yield generate(true, response);
          }
          retry = 0;
        } catch (err) {
          if (
            isNetworkError(err) ||
            (isAbortError(err) && controller.signal.reason === 'retry')
          ) {
            useRealmState.getState().setRealmInfo({
              title: `realm.retry`,
              content: `(${maxRetry + 1 - retry}/${maxRetry})`,
            });
            retry--;
          } else {
            throw err;
          }
        } finally {
          finished = true;
        }
      }
    }
  },
};
