import { BusinessError } from '@/interceptors';
import { PresetItem } from '@/presets';
import { storages } from '@/presets/server/factory';
import { Tool, tools } from '@/tools';
import { archives } from '@/utils/archive';

import { providers } from './providers';

function provider(type: string) {
  const provider = providers.registry.records[type];
  if (!provider) {
    // 调用点会立刻用返回值，这里必须抛错，否则会变成裸 TypeError
    throw new BusinessError(
      `tool provider ${type} is not registered.`,
      'error.tool.provider_not_registered',
    ).withValue('type', type);
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
