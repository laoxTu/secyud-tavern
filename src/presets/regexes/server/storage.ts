import { storages } from '@/presets/server/factory';
import { Accessor, archives } from '@/utils/archive';

import { Regex, regexes } from '..';

type AccessorKey = 'replacement';
const accessor: Record<AccessorKey, Accessor<Regex>> = {
  replacement: {
    get: (i) => i.replacement,
    set: (i, t) => (i.replacement = t),
  },
};

export const storage = storages.create<Regex>(
  regexes,
  ({ name, data: { target } }) => ({
    sorter: `${name}`,
    filter: `${target}${name}`,
  }),
  (entry, s) => `${entry.name}-${s}`,
  async ({ cur }, entry, name) => {
    archives.set.value(
      cur,
      entry,
      accessor.replacement,
      `${name}.replacement.txt`,
    );
  },
  async ({ cur }, entry) => {
    await archives.get.value(cur, entry, accessor.replacement);
  },
);
