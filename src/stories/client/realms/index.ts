'use client';
import { NameValue } from '@/database';
import { BusinessError } from '@/interceptors';
import { models } from '@/models/client';
import { Realm, RealmHistory } from '@/stories';
import { stories } from '@/stories/client';
import { arrUtils, jsonUtils } from '@/utils';
import { patch } from '@/utils/json-patch';

import { useRealmState } from './state';

function outputs(history?: RealmHistory | null) {
  if (!history?.outputs.length) return null;
  const outputId = Math.min(history.outputs.length - 1, history.output);
  return history.outputs[outputId];
}

function variables(history: RealmHistory, output: boolean = true) {
  const variables = structuredClone(history.variables);
  console.debug('[variables](before patch): ', history.variables);
  console.debug('[variables](after patch): ', variables);
  for (const input of history.prompts) {
    patch(variables, input.variables);
  }
  if (output && history.outputs.length > 0) {
    const list = outputs(history);
    if (list)
      for (const output of list) {
        patch(variables, output.variables);
      }
  }
  return variables;
}

/**
 * 读取初始化好的缓存
 * 未初始化说明漏了，直接报错
 * @param realm
 * @param key
 */
function context<T = any>(realm: Realm, key: string): T {
  realm.context ??= {};
  const value = realm.context[key];
  if (value === undefined) {
    console.debug('[realm](context): ', realm.context);
    throw new BusinessError(
      `realm context "${key}" is not initialized. (${JSON.stringify(Object.keys(realm.context ?? {}))})`,
      'error.story.realm_not_initialized',
    ).withValue('key', key);
  }
  return value as T;
}

// 初始化缓存；同键禁止重复初始化，防止两个引擎/插件意外共用同一 key 互相覆盖。
/**
 * 初始化缓存，同键禁止重复初始化
 * 防止两个引擎/插件意外共用同一key互相覆盖。
 * @param realm
 * @param key
 * @param value
 */
function initContext(realm: Realm, key: string, value: any) {
  realm.context ??= {};
  if (realm.context[key] !== undefined || value === undefined) {
    throw new BusinessError(
      `realm content "${key}" already initialized`,
      'realm.content_already_initialized',
    ).withValue('key', key);
  }
  realm.context[key] = value;
}

/**
 * 获取开场白，若没有则创建
 * 把各预设opening解析为输出消息，
 * 作为变量的初始来源（懒生成并缓存）
 * @param realm
 */
function opening(realm: Realm) {
  const key = 'opening';
  let opening = realm.context?.[key] as RealmHistory;
  if (!opening) {
    const variables = {};
    for (const preset of realm.presets) {
      jsonUtils.merge(variables, jsonUtils.parse(preset.variables));
    }
    opening = {
      masterId: realm.id,
      sequence: -1,
      prompts: [
        {
          content: '',
          variables: [],
          properties: {},
        },
      ],
      summary: true,
      output: 0,
      outputs: [],
      variables,
    };
    opening.outputs.push(
      realm.presets
        .map((u) => u.opening?.trim())
        .filter((u) => u)
        .map((v) => ({
          content: v!,
          variables: [],
          properties: {},
          thought: '',
        })),
    );
    // 懒生成写入，setContent 会检测同键重复初始化
    initContext(realm, key, opening);
    console.log('[realm](opening): ', opening);
  }
  return opening;
}

/**
 * 获取模型，一般工具使用
 * 如果没设置就使用故事的模型
 * @param model
 * @param realm
 */
async function model(realm: Realm, model?: NameValue | null) {
  return model ? await models.proxy.get(model.value) : realm.model;
}

async function getHistory(index: number | null, realm: Realm) {
  const histories = realm.histories;
  // 渲染开场白
  if (index === 0 || !histories.length) return opening(realm);
  index ??= histories.length;
  index = Math.min(Math.max(1, index), histories.length);
  let history = histories[index - 1]!;
  if (!history) {
    history = await stories.proxy.history.get(realm.id, index - 1);
    histories[index - 1] = history;
  }
  return history;
}

async function setHistory(index: number, realm: Realm) {
  if (index === 0) return;
  const history = await getHistory(index, realm);
  await stories.proxy.history.set(realm.id, history.sequence, history);
}

function postMessage(type: string, data: any) {
  const window = realms.iframe?.contentWindow;
  if (!window) {
    console.error('iframe is not accessible this time.');
    return;
  }
  const g = window as { __messageData?: Record<string, any> };
  g.__messageData ??= new Map<string, any>();
  g.__messageData[type] = data;
  window.postMessage({ type }, '*');
}

/**
 * 生成回复
 */
async function generate(create: boolean = false) {
  const get = useRealmState.getState;
  const { generating, content, summary, setIndex, setRealmInfo, setSignal } =
    get();
  const { realm, histories, iframe } = realms;
  const set = useRealmState.setState;
  if (generating) return;
  set({
    generating: true,
    realmInfo: {
      title: 'realm.generating',
      content: '',
    },
  });
  if (create) {
    try {
      set({ summary: false, content: '' });
      let variables = undefined;
      let input = content.trim();
      if (iframe.contentWindow) {
        const window = iframe.contentWindow as any;
        (
          window?.userInput?.inputBuilders as {
            id: string;
            sequence?: number;
            build: (text: string) => string;
          }[]
        )
          ?.sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0))
          .forEach((builder) => {
            input = builder.build(input);
          });
      }

      // 如果上一个历史还未输出，合并到上一个历史。
      // 如果上一个历史已经输出，创建新的历史。
      // 如果还没有历史，使用开场白变量。
      let history = histories.at(-1)!;
      if (history) {
        if (history.outputs.length > 0) {
          variables = realms.variables(history);
        }
      } else {
        variables = realms.variables(opening(realm));
      }
      // 有开场variables，意味着创建新历史
      if (variables) {
        history = {
          masterId: realm.id,
          sequence: histories.length,
          output: -1,
          prompts: [],
          outputs: [],
          summary,
          variables,
        };
        histories.push(history);
      }

      history.prompts.push({
        content: input,
        variables: [],
        properties: {},
      });
      // 用户输入后立即跳转到最新页面，先渲染用户输入。
      await setIndex(histories.length);
      // 有开场variables，新历史需要保存
      if (variables) {
        const { sequence } = await stories.proxy.history.add(realm.id, history);
        history.sequence = sequence;
      }
    } catch (err) {
      set({ summary: false, content: '' });
      throw err;
    }
  }
  // 创建并保存历史后需要生成回复
  try {
    const history = await getHistory(null, realm);
    const setIndexCur = async () => {
      history.output = history.outputs.length - 1;
      await setIndex(histories.length);
    };

    let thoughtLen = 0;
    let toolArgLen = 0;
    for await (const { output } of models.processers.generate({
      realm,
      signal: async (signal) => {
        await setIndexCur();
        if (signal) setSignal(signal);
      },
    })) {
      const curThoughtLen = output.thought.length;
      const curToolArgLen =
        output.callings?.reduce((u, c) => u + c.arguments.length, 0) ?? 0;
      if (curThoughtLen !== thoughtLen) {
        thoughtLen = curThoughtLen;
        setRealmInfo({
          content: `${thoughtLen}`,
          title: 'realm.thinking',
        });
      } else if (curToolArgLen !== toolArgLen) {
        toolArgLen = curToolArgLen;
        setRealmInfo({
          content: `${toolArgLen}`,
          title: 'realm.generating_tool',
        });
      } else {
        setRealmInfo({
          content: `${output.content.length}`,
          title: 'realm.generating',
        });
      }
      // 流式渲染条件
      // 故事页面为最新，输出页面为最新
      const { index } = get();
      if (
        index.cur === histories.length &&
        history.output === history.outputs.length - 1
      ) {
        await stories.renderers.stream({ history, realm });
      }
    }
    await setIndexCur();
    // 解析输出，填充一些选项或处理，这里应该会缓存世界书
    await models.processers.output({ realm });
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      console.log('user abort reply');
    } else throw err;
  } finally {
    set({ generating: false });
    await setIndex(histories.length);
    await setHistory(histories.length, realm);
  }
}

export const realms = {
  realm: null! as Realm,
  iframe: null! as HTMLIFrameElement,
  get histories() {
    return realms.realm?.histories!;
  },
  outputs,
  variables,
  model,
  opening,
  initContext,
  context,
  generate,
  cache<T = any>(realm: Realm, key: string) {
    return context<T>(realm, realms.key(key));
  },
  history: {
    get: getHistory,
    set: setHistory,
  },
  message: {
    post: postMessage,
    variables(history: RealmHistory) {
      postMessage('variables', variables(history));
    },
    async content(
      history: RealmHistory,
      handler: (str: string, role: string, type: string) => Promise<string>,
    ) {
      const messages = outputs(history) ?? [];
      const res = {
        inputs: await Promise.all(
          history.prompts
            .filter((u) => u.content)
            .map((u) => handler(u.content, 'user', 'input')),
        ),
        output: await handler(
          arrUtils.join(messages, '\n', (u) => u.content).trim(),
          'assistant',
          'output',
        ),
        thought: arrUtils.join(messages, '\n', (u) => u.thought).trim(),
      };
      postMessage('content', res);
    },
  },
  key(id: string) {
    return `realm.${id}`;
  },
};
export * from './state';
