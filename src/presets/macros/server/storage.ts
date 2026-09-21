import { PresetItem } from '@/presets';
import { storages } from '@/presets/server/factory';
import { archives } from '@/utils/archive';

import { Macro, macros } from '..';

export const storage = storages.create<Macro>(
  macros,
  ({ name, data: { key, multiple, hidden } }) => ({
    sorter: `${key}${+multiple}${+hidden}`,
    filter: `${key}${name}`,
  }),
  async ({ cur }, item, s) => {
    const name = `${item.code}-${item.key}-${s}`;
    const ext = item.json ? 'json' : 'txt';

    archives.set.json(cur, `${name}.meta.json`, {
      ...item,
      value: undefined,
    });
    archives.set.text(cur, `${name}.value.${ext}`, item.value);
  },
  async ({ cur }, name) => {
    const item = await archives.get.json<PresetItem<Macro>>(
      cur,
      `${name}.meta.json`,
    );
    if (item) {
      item.value = await archives.get.fuzzy(cur, `${name}.value.`);
    }
    return item;
  },
);
