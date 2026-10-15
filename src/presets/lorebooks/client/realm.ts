import { insert } from '@orama/orama';

import { utils } from '@/database';
import { Processer } from '@/models/client';
import { Preset, PresetItem } from '@/presets';
import {
  AlwaysMatchConfig,
  alwaysMatcher,
} from '@/presets/matchers/client/always';
import { vectorMatcher } from '@/presets/matchers/client/vector';
import { Rag, rags } from '@/stories/memories/client';
import { tools } from '@/tools';
import { jsonUtils } from '@/utils';

import { Lorebook, lorebooks as main } from '..';

import { builders } from './builder';

import { lorebooks } from '.';

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
    ctx.injects.push((inject) => {
      const builderName = inject.builder;
      const builder =
        builders.registry.record(builderName) ??
        builders.registry.records[builders.default.id];
      return builder.create(ctx, inject, cache);
    });
  },
};
