import { PresetItem } from '@/presets';
import { storages } from '@/presets/server/factory';
import { archive } from '@/utils/archive';

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

    archive.set.json(cur, `${name}.meta.json`, {
      ...item,
      value: undefined,
    });
    archive.set.text(cur, `${name}.value.${ext}`, item.value);
  },
  async ({ cur }, name) => {
    const item = await archive.get.json<PresetItem<Macro>>(
      cur,
      `${name}.meta.json`,
    );
    if (item) {
      item.value = await archive.get.fuzzy(cur, `${name}.value.`);
    }
    return item;
  },
);
