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
  async (item, s) => {
    const name = `${item.name}-${s}`;
    return [archive.json(`${name}.meta.json`, item)];
  },
  async (nodes, name) => {
    const item = archive.getJson<PresetItem<Regex>>(nodes, `${name}.meta.json`);
    return item;
  },
);
