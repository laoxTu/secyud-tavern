import { insert } from '@orama/orama';

import { utils } from '@/database';
import { memories as main, Memory } from '@/memories';
import { memories } from '@/memories/client';
import {
  InjectMessage,
  ModelInjectContext,
  ModelPromptContext,
  models,
  Processer,
} from '@/models/client';
import { Realm, StoryItem } from '@/stories';
import { realms } from '@/stories/client/realms';
import { ToolCall } from '@/tools';
import { arrUtils } from '@/utils';

import { Rag, rags } from './rag';

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
  { histories }: ModelPromptContext,
  { name, caller }: ModelInjectContext,
  cache: MemoryCache,
): Promise<InjectMessage> {
  const visited = new Set<number>();
  let simulation = 0;
  return {
    behind: async (i) => {
      if (i === histories.length - 1) return;
      // 需要注入内容
      const items: StoryItem<Memory>[] = [];
      const visitedKeys = new Set<number>();
      const history = histories[i];
      const outputs = realms.outputs(history);
      if (!outputs) return;
      for (const output of outputs) {
        const idsList = memories.codes(output, false);
        if (!idsList?.length) continue;
        for (const ids of idsList) {
          for (const id of ids) {
            if (visitedKeys.has(id)) continue;
            visitedKeys.add(id);
            const memory = cache.memories[id];
            if (!memory) continue;
            if (visited.has(id)) continue;
            visited.add(id);
            items.push(memory);
          }
        }
      }
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
