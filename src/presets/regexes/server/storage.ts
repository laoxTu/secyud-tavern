import { PresetItem } from '@/presets';
import { storages } from '@/presets/server/factory';
import { archives } from '@/utils/archive';

import { Regex, regexes } from '..';

export const storage = storages.create<Regex>(
  regexes,
  ({ name, data: { target } }) => ({
    sorter: `${name}`,
    filter: `${target}${name}`,
  }),
  async ({ cur }, item, s) => {
    const name = `${item.name}-${s}`;
    archives.set.json(cur, `${name}.meta.json`, async () => item);
  },
  async ({ cur }, name) => {
    const item = await archives.get.json<PresetItem<Regex>>(
      cur,
      `${name}.meta.json`,
    );
    return item;
  },
);
