import { BusinessError } from '@/interceptors';
import { storages } from '@/presets/server/factory';
import { Tool, tools } from '@/tools';

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
  (entry, s) => `${entry.name}-${s}`,
  async (ctx, entry, name) => {
    await provider(entry.type).loadArchive?.({ ...ctx, entry, name });
  },
  async (ctx, entry, name) => {
    await provider(entry.type).saveArchive?.({ ...ctx, entry, name });
  },
);
