import { storages } from '@/presets/server/factory';
import { Accessor, archives } from '@/utils/archive';

import { Style, styles } from '..';

type AccessorKey = 'content';
const accessor: Record<AccessorKey, Accessor<Style>> = {
  content: {
    get: (i) => i.content,
    set: (i, t) => (i.content = t),
  },
};

export const storage = storages.create<Style>(
  styles,
  ({ name, data: { code, type, priority } }) => ({
    sorter: `${name}${code}`,
    filter: `${type}${String(priority).padStart(5, '0')}${name}`,
  }),
  (entry, s) => `${entry.code}-${s}`,
  async ({ cur }, entry, name) => {
    const ext = entry.type === 'link' ? 'txt' : 'css';
    archives.set.value(cur, entry, accessor.content, `${name}.style.${ext}`);
  },
  async ({ cur }, entry) => {
    await archives.get.value(cur, entry, accessor.content);
  },
);
