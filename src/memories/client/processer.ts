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
import { Preset } from '@/presets';
import { StoryItem } from '@/stories';
import { realms } from '@/stories/client/realms';
import { ToolCall } from '@/tools';
import { tools } from '@/tools/client';
import { arrUtils } from '@/utils';

import { Rag, rags } from './rag';

export const memorySchema = {
  entryId: 'number',
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
      const newMemories: StoryItem<Memory>[] = [];
      // 只注入Key
      const keyMemories: StoryItem<Memory>[] = [];
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
            keyMemories.push(memory);
            if (visited.has(id)) continue;
            visited.add(id);
            newMemories.push(memory);
          }
        }
      }
      if (!keyMemories.length) return;
      const callings: ToolCall[] = [];
      if (newMemories.length) {
        callings.push({
          index: callings.length,
          id: `${name(simulation++)}m`,
          name: models.engines.knowledge.info.name,
          arguments: models.engines.knowledge.args({
            type: 'memory_dict',
          }),
          result: arrUtils.join(
            newMemories,
            '\n',
            (u) => `- ${u.name}: ${u.text}`,
          ),
        });
      }
      callings.push({
        index: callings.length,
        id: `${name(simulation++)}m`,
        name: models.engines.knowledge.info.name,
        arguments: models.engines.knowledge.args({
          type: 'memory',
        }),
        result: arrUtils.join(keyMemories, '\n', (u) => u.name),
      });
      caller('', null, callings);
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
      await utils.forEachItemsList<StoryItem<Memory>, Preset>(
        realm.presets,
        tools.plural,
        async (entry) => {
          cache.memories[entry.entryId] = entry;
          const embedding = await embed.generate({ content: entry.text });
          await insert(database, {
            entryId: entry.entryId,
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
    ctx.injects.push((injectCtx) => create(ctx, injectCtx, cache));
  },
};
