import { storages } from '@/presets/server/factory';
import { archives } from '@/utils/archive';

import { Macro, macros } from '..';

export const storage = storages.create<Macro>(
  macros,
  ({ name, data: { key, multiple, hidden } }) => ({
    sorter: `${key}${+multiple}${+hidden}`,
    filter: `${key}${name}`,
  }),
  async ({ cur }, entry, s) => {
    const name = `${entry.code}-${entry.key}-${s}`;
    const ext = entry.json ? 'json' : 'txt';

    archives.set.text(cur, `${name}.value.${ext}`, entry.value);
    entry.value = undefined;
    return name;
  },
  async ({ cur }, entry, name) => {
    entry.value = await archives.get.fuzzy(cur, `${name}.value.`);
  },
);
