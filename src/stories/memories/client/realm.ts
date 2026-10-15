import { insert } from '@orama/orama';

import { utils } from '@/database';
import {
  InjectMessage,
  ModelInjectContext,
  ModelPromptContext,
  models,
  Processer,
} from '@/models/client';
import { Realm, StoryItem } from '@/stories';
import { ToolCall } from '@/tools';
import { arrUtils } from '@/utils';

import { memories as main, Memory } from '..';

import { Rag, rags } from './rag';

import { memories } from '.';

export const memorySchema = {
  entryId: 'number',
  title: 'string',
  tags: 'string[]',
  type: 'string',
  importance: 'number',
  sequence: 'number',
} as const;

export interface MemoryCache {
  rag: Rag<typeof memorySchema> | null;
  memories: Record<number, StoryItem<Memory>>;
}

async function create(
  {}: ModelPromptContext,
  { name, caller }: ModelInjectContext,
  cache: MemoryCache,
): Promise<InjectMessage> {
  const visited = new Set<number>();
  let simulation = 0;
  return {
    output: async (_history, output, next) => {
      // 需要注入内容
      const items: StoryItem<Memory>[] = [];
      for (const ids of memories.codes(output, false) ?? []) {
        for (const id of ids) {
          const memory = cache.memories[id];
          if (visited.has(id) || !memory) continue;
          visited.add(id);
          items.push(memory);
        }
      }
      await next();
      console.debug(`[memroy]: `, items);
      if (items.length) {
        const callings: ToolCall[] = [];
        callings.push({
          index: callings.length,
          id: `${name(simulation++)}m`,
          name: models.engines.knowledge.info.name,
          arguments: models.engines.knowledge.args({
            type: 'memory',
          }),
          result: arrUtils.join(items, '\n', (u) => `- ${u.name}: ${u.text}`),
        });
        caller('', null, callings);
      }
    },
  };
}

export const processer: Processer<MemoryCache> = {
  id: main.name,
  async init({ realm }) {
    const cache: MemoryCache = {
      rag: await rags.create(memorySchema),
      memories: {},
    };
    if (cache.rag) {
      const { database, embed } = cache.rag;
      await utils.forEachItems<StoryItem<Memory>, Realm>(
        realm,
        memories.plural,
        async (entry) => {
          cache.memories[entry.entryId] = entry;
          const embedding = await embed.generate({ content: entry.text });
          await insert(database, {
            entryId: entry.entryId,
            title: entry.name,
            tags: entry.tags,
            type: entry.type,
            importance: entry.importance,
            sequence: entry.sequence,
            embedding,
          });
        },
      );
    }
    console.debug(`[memory](cache): `, cache);
    return cache;
  },
  async prompt(ctx, cache) {
    console.debug(`[memory](cache): `, cache);
    ctx.injects.push((injectCtx) => create(ctx, injectCtx, cache));
  },
};
