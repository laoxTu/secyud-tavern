import { insert } from '@orama/orama';

import { utils } from '@/database';
import { Lorebook, lorebooks as main } from '@/lorebooks';
import { lorebooks } from '@/lorebooks/client';
import { Rag, rags } from '@/memories/client/rag';
import {
  InjectMessage,
  ModelInjectContext,
  ModelPromptContext,
  models,
  Processer,
} from '@/models/client';
import { Preset, PresetItem } from '@/presets';
import { macros } from '@/presets/macros/client';
import {
  RealmHistory,
  RealmMessage,
  RealmOutput,
  RealmPrompt,
} from '@/stories';
import { realms } from '@/stories/client/realms';
import { tools } from '@/tools';
import { arrUtils, jsonUtils } from '@/utils';

import { matchers } from './matcher';
import { AlwaysMatchConfig, alwaysMatcher } from './matchers/always';
import { vectorMatcher } from './matchers/vector';

const lorebookSchema = {
  name: 'string',
  title: 'string',
} as const;

export interface LorebookCache {
  before: PresetItem<Lorebook>[];
  after: PresetItem<Lorebook>[];
  entries: Record<string, PresetItem<Lorebook>>;
  rag: Rag<typeof lorebookSchema> | null;
}

/**
 * 创建世界书注入器
 */
async function create(
  { histories, converts, realm }: ModelPromptContext,
  { builder, name, prompt, assist, system, caller }: ModelInjectContext,
  cache: LorebookCache,
): Promise<InjectMessage> {
  const visited = new Set<string | undefined>();
  const list: PresetItem<Lorebook>[] = [];
  let simulation = 0;
  switch (builder) {
    case 'layered': {
      await fixed(cache.before);
      await fixed(cache.after);
      for (const history of histories) {
        await moved(history, history.prompts, false);
        if (history === histories.at(-1)) break;
        await moved(history, realms.outputs(history), true);
      }
      list.sort(lorebooks.compare);
      let index = 0;
      return {
        async middle(i: number) {
          const items: PresetItem<Lorebook>[] = [];
          for (; index < list.length; index++) {
            const u = list[index];
            if (
              i === histories.length - 1 ||
              u.layer + histories.length >= i + 100
            )
              break;
            items.push(u);
          }
          await inject(items);
        },
      };
    }
    default:
      let index = 0;
      await fixed(cache.before);
      return {
        async before(i: number) {
          const history = histories[i];
          await moved(history, history.prompts, false);
          if (i === histories.length - 1) await fixed(cache.after);
          list.sort(lorebooks.compare);
          const c = list.findIndex((u) => u.layer >= 100);
          index = c < 0 ? list.length : c;
          // 添加user前世界书
          await inject(list.slice(0, index));
        },
        async middle() {
          // 添加user后世界书
          await inject(list.slice(index, list.length));
          list.length = 0;
        },
        async behind(i: number) {
          if (i === histories.length - 1) return;
          const history = histories[i];
          await moved(history, realms.outputs(history), true);
        },
      };
  }

  /**
   * 注入世界书
   * @param items
   */
  async function inject(items: PresetItem<Lorebook>[]) {
    const groups = arrUtils.groupSerial(items, (u) => u.role);
    console.debug('[lorebook]: ', items);
    for (const group of groups) {
      const contents: string[] = [];
      for (const item of group.items) {
        const content = await models.convert(converts, item.content ?? '', {
          role: group.key,
          type: 'output',
          history: null,
        });
        contents.push(content);
      }
      const content = arrUtils.join(contents, '\n\n');
      switch (group.key) {
        case 'knowledge':
          simulation += 1;
          caller('', null, [
            {
              index: 0,
              id: `${name(simulation)}l`,
              name: models.engines.knowledge.info.name,
              arguments: models.engines.knowledge.args({
                type: 'lorebook',
              }),
              result: content,
            },
          ]);
          break;
        case 'system':
          system(content);
          break;
        case 'assistant':
          assist(content, null);
          break;
        case 'user':
          prompt(content);
          break;
        default:
          break;
      }
    }
  }

  /**
   * 滑动注入lorebook
   * @param history
   * @param messages
   * @param output
   */
  async function moved(
    history: RealmHistory,
    messages: RealmMessage[] | null,
    output: boolean,
  ) {
    if (!messages?.length) return;
    for (const message of messages) {
      let ids = message.properties?.[lorebooks.plural];
      if (!ids) {
        const context = {
          history,
          properties: {},
          cache,
        };
        ids = await matchers.analyze(
          cache.entries,
          output
            ? {
                ...context,
                message: message as RealmOutput,
                output: true,
              }
            : {
                ...context,
                message: message as RealmPrompt,
                output: false,
              },
        );
      }
      for (const id of ids) {
        if (visited.has(id)) continue;
        visited.add(id);
        const lorebook = cache.entries[id];
        if (lorebook) {
          list.push(cache.entries[id]);
        }
      }
    }
  }

  /**
   * 一次性注入lorebook
   * @param items
   */
  async function fixed(items: PresetItem<Lorebook<AlwaysMatchConfig>>[]) {
    const { checkItems } = macros.property(realm);
    for (const lorebook of items) {
      if (visited.has(lorebook.id)) {
        continue;
      }
      visited.add(lorebook.id);
      if (!lorebook.expression.macro || !checkItems[lorebook.code])
        list.push(lorebook);
    }
  }
}

export const processer: Processer = {
  id: main.name,
  // 匹配依赖工具, 有些是工具预填充, 然后匹配器收集
  requires: [tools.name],
  init: async ({ realm }) => {
    const cache: LorebookCache = {
      before: [],
      after: [],
      entries: {},
      rag: await rags.create(lorebookSchema),
    };
    await utils.forEachItemsList<PresetItem<Lorebook>, Preset>(
      realm.presets,
      lorebooks.plural,
      async (entry, item) => {
        entry.id = `${item.id}-${entry.code}`;
        const { disabled, match, type, expression } = entry;
        if (disabled) return;
        if (type === 'json') {
          entry.content = jsonUtils.minify(entry.content);
        }
        if (match === alwaysMatcher.id) {
          if ((expression as AlwaysMatchConfig)?.last) cache.after.push(entry);
          else cache.before.push(entry);
        } else {
          cache.entries[entry.id ?? ''] = entry;
        }

        if (cache.rag && entry.match === vectorMatcher.id) {
          const { embed, database } = cache.rag;
          const embedding = await embed.generate({
            content: entry.content ?? '',
          });
          await insert(database, {
            name: entry.id,
            title: entry.name,
            embedding,
          });
        }
      },
    );
    console.debug(`[lorebook](cache): `, cache);
    return cache;
  },
  async prompt(ctx, cache: LorebookCache) {
    ctx.injects.push((inject) => create(ctx, inject, cache));
  },
  async output({ history }, cache: LorebookCache) {
    const outputs = realms.outputs(history);
    if (!outputs) return;
    for (const message of outputs) {
      await matchers.analyze(cache.entries, {
        history,
        message,
        properties: {},
        output: true,
        cache,
      });
    }
  },
};
