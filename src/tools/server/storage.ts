import { PresetItem } from '@/presets';
import { storages } from '@/presets/server/factory';
import { Tool, tools } from '@/tools';
import { archive } from '@/utils/archive';

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
  async (item, s) => {
    const name = `${item.name}-${s}`;
    return [
      ...(await provider(item.type).loadArchive(item, name)),
      archive.json(`${name}.meta.json`, item),
    ];
  },
  async (nodes, name) => {
    const item = archive.getJson<PresetItem<Tool>>(nodes, `${name}.meta.json`);
    if (item) {
      await provider(item.type).saveArchive(nodes, item, name);
    }
    return item;
  },
);
