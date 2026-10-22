import { storages } from '@/presets/server/factory';
import { Accessor, archives } from '@/utils/archive';

import { Macro, macros } from '..';

type AccessorKey = 'value';
const accessor: Record<AccessorKey, Accessor<Macro>> = {
  value: {
    get: (i) => i.value,
    set: (i, t) => (i.value = t),
  },
};
export const storage = storages.create<Macro>(
  macros,
  ({ name, data: { key, multiple, hidden } }) => ({
    sorter: `${key}${+multiple}${+hidden}`,
    filter: `${key}${name}`,
  }),
  (entry, s) => `${entry.code}-${entry.key}-${s}`,
  async ({ cur }, entry, name) => {
    const ext = entry.json ? 'json' : 'txt';
    archives.set.value(cur, entry, accessor.value, `${name}.value.${ext}`);
  },
  async ({ cur }, entry) => {
    await archives.get.value(cur, entry, accessor.value);
  },
);
