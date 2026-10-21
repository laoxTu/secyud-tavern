import { storages } from '@/presets/server/factory';
import { Accessor, archives } from '@/utils/archive';

import { Lorebook, lorebooks } from '..';

type AccessorKey = 'content';
const accessor: Record<AccessorKey, Accessor<Lorebook>> = {
  content: {
    get: (i) => i.content,
    set: (i, t) => (i.content = t),
  },
};
export const storage = storages.create<Lorebook>(
  lorebooks,
  ({ name, data: { code, match } }) => ({
    sorter: `${match}${code}${name}`,
    filter: `${match}${code}${name}`,
  }),
  (entry, s) => `${entry.code}-${s}`,
  async ({ cur }, entry, name) => {
    const ext = lorebooks.typeToExt(entry.type);
    archives.set.value(cur, entry, accessor.content, `${name}.content.${ext}`);
  },
  async ({ cur }, entry, name) => {
    await archives.get.value(cur, entry, accessor.content);
  },
);
