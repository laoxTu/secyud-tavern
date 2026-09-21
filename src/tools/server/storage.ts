import { PresetItem } from '@/presets';
import { storages } from '@/presets/server/factory';
import { Tool, tools } from '@/tools';
import { archives } from '@/utils/archive';

import { providers } from './providers';

function provider(type: string) {
  const provider = providers.registry.records[type];
  if (!provider) {
    console.error(`[tool]: provider ${type} is not registered.`);
  }
  return provider;
}

export const storage = storages.create<Tool>(
  tools,
  ({ name, data: { type } }) => ({
    sorter: `${type}${name}`,
    filter: `${type}${name}`,
  }),
  async (ctx, entry, s) => {
    const name = `${entry.name}-${s}`;
    await provider(entry.type).loadArchive({ ...ctx, entry, name });
    archives.set.json(ctx.cur, `${name}.meta.json`, entry);
  },
  async (ctx, name) => {
    const entry = await archives.get.json<PresetItem<Tool>>(
      ctx.cur,
      `${name}.meta.json`,
    );
    if (entry) {
      await provider(entry.type).saveArchive({ ...ctx, entry, name });
    }
    return entry;
  },
);
