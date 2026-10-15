'use client';
import { NameValue } from '@/database';
import { BusinessError } from '@/interceptors';
import { ConvertContent, models } from '@/models/client';
import { Realm, RealmHistory } from '@/stories';
import { stories } from '@/stories/client';
import { proxy } from '@/stories/client/proxy';
import { arrUtils, jsonUtils } from '@/utils';
import { patch } from '@/utils/json-patch';

import { useRealmState } from './state';

function space(history?: RealmHistory | null) {
  if (!history?.spaces.length) return null;
  const index = Math.min(history.spaces.length - 1, history.index);
  return history.spaces[index];
}

/**
 * 取出历史当前的变量
 * @param history
 * @returns
 */
function variables(history: RealmHistory) {
  const variables = structuredClone(history.variables);
  console.debug('[variables](before patch): ', history.variables);
  patch(variables, space(history)?.operations);
  console.debug('[variables](after patch): ', variables);
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
      index: 0,
      summary: true,
      content: '',
      variables,
      spaces: [
        {
          operations: [],
          outputs: [
            ...realm.presets
              .map((u) => u.opening?.trim())
              .filter((u) => u)
              .map((v) => ({
                content: v!,
                thought: '',
              })),
            {
              content: '',
              thought: '',
            },
          ],
        },
      ],
    };
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
 * 保存改变的历史轮次
 */
async function save(realm: Realm) {
  for (const history of Object.values(realm.changes)) {
    history.changed = undefined;
    await proxy.history.set(realm.id, history.sequence, history);
  }
}
/**
 * 生成回复
 */
async function generate() {
  const get = useRealmState.getState;
  const set = useRealmState.setState;
  const { generating, setIndex, setRealmInfo, setSignal } = get();
  const { realm, histories } = realms;
  if (generating) return;

  // 创建并保存历史后需要生成回复
  try {
    set({
      generating: true,
      realmInfos: {
        main: {
          title: 'realm.generating',
        },
      },
    });
    const history = await getHistory(null, realm);
    realms.change(realm, history);
    const setIndexCur = async () => {
      history.index = history.spaces.length - 1;
      await setIndex(histories.length);
    };

    const controller = new AbortController();
    setSignal(controller);

    let thoughtLen = 0;
    let toolArgLen = 0;
    let indexed = false;
    for await (const { output } of models.processers.generate({
      realm,
      controller,
    })) {
      const curThoughtLen = output.thought.length;
      const curToolArgLen =
        output.callings?.reduce((u, c) => u + c.arguments.length, 0) ?? 0;
      if (curThoughtLen !== thoughtLen) {
        thoughtLen = curThoughtLen;
        setRealmInfo('main', {
          content: `${thoughtLen}`,
          title: 'realm.thinking',
        });
      } else if (curToolArgLen !== toolArgLen) {
        toolArgLen = curToolArgLen;
        setRealmInfo('main', {
          content: `${toolArgLen}`,
          title: 'realm.generating_tool',
        });
      } else {
        setRealmInfo('main', {
          content: `${output.content.length}`,
          title: 'realm.generating',
        });
      }

      if (!indexed) {
        indexed = true;
        await setIndexCur();
      }

      // 流式渲染条件
      // 故事页面为最新，输出页面为最新
      const { index } = get();
      if (
        index.cur === histories.length &&
        history.index === history.spaces.length - 1
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
    await save(realm);
    setSignal();
  }
}
export const realms = {
  realm: null! as Realm,
  iframe: null! as HTMLIFrameElement,
  get histories() {
    return realms.realm?.histories!;
  },
  space,
  variables,
  model,
  opening,
  initContext,
  context,
  generate,
  cache<T = any>(realm: Realm, key: string) {
    return context<T>(realm, realms.key(key));
  },
  history: getHistory,
  change(realm: Realm, history: RealmHistory) {
    history.changed = true;
    realm.changes[history.sequence] = history;
  },
  save,
  input() {
    const { content } = useRealmState.getState();
    let input = content.trim();
    // 用户输入可以联动内部
    const window = realms.iframe.contentWindow as any;
    if (window) {
      const builders = window?.userInput?.inputBuilders as {
        id: string;
        sequence?: number;
        build: (text: string) => string;
      }[];
      builders
        ?.sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0))
        .forEach((builder) => {
          input = builder.build(input);
        });
    }
    return input;
  },
  // 与iframe 通信
  message: {
    post: postMessage,
    variables(history: RealmHistory) {
      postMessage('variables', variables(history));
    },
    async content(history: RealmHistory, handler: ConvertContent) {
      const outputs = space(history)?.outputs;
      const res = {
        inputs: await handler(history.content, {
          role: 'user',
          type: 'input',
          history,
        }),
        output: await handler(
          arrUtils.join(outputs, '\n', (u) => u.content).trim(),
          {
            role: 'assistant',
            type: 'output',
            history,
          },
        ),
        thought: arrUtils.join(outputs, '\n', (u) => u.thought).trim(),
      };
      console.debug('[realm]: message', res);
      postMessage('content', res);
    },
  },
  key(id: string) {
    return `realm.${id}`;
  },
};
export * from './state';
