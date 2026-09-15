import { PresetItem } from '@/presets';
import { storages } from '@/presets/server/factory';
import { archive } from '@/utils/archive';

import { Regex, regexes } from '..';

export const storage = storages.create<Regex>(
  regexes,
  ({ name, data: { target } }) => ({
    sorter: `${name}`,
    filter: `${target}${name}`,
  }),
  async (nodes, item, s) => {
    const name = `${item.name}-${s}`;
    archive.set.json(nodes, `${name}.meta.json`, async () => item);
  },
  async (nodes, name) => {
    const item = await archive.get.json<PresetItem<Regex>>(
      nodes,
      `${name}.meta.json`,
    );
    return item;
  },
);
