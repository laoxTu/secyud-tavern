import { utils } from '@/database';
import { Processer } from '@/models/client';
import { Preset, PresetItem } from '@/presets';
import { matchers } from '@/presets/matchers/client';
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
        const { disabled, match, type } = entry;
        if (disabled) return;
        if (type === 'json') {
          entry.content = jsonUtils.minify(entry.content);
        }
        cache.entries[entry.id ?? ''] = entry;
        const matcher = matchers.registry.record(match);
        if (matcher) await matcher.initialize?.(realm, cache, entry);
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
