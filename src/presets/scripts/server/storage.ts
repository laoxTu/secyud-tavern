import { storages } from '@/presets/server/factory';
import { Accessor, archives } from '@/utils/archive';

import { Script, scripts } from '..';

function mapToExt(type: string | null) {
  switch (type) {
    case 'link':
      return 'txt';
    case 'importmap':
      return 'json';
    default:
      return 'js';
  }
}

type AccessorKey = 'content';
const accessor: Record<AccessorKey, Accessor<Script>> = {
  content: {
    get: (i) => i.content,
    set: (i, t) => (i.content = t),
  },
};

export const storage = storages.create<Script>(
  scripts,
  ({ name, data: { code, type, priority } }) => ({
    sorter: `${name}${code}`,
    filter: `${type}${String(priority).padStart(5, '0')}${name}`,
  }),
  (entry, s) => `${entry.code}-${s}`,
  async ({ cur }, entry, name) => {
    const ext = mapToExt(entry.type);
    archives.set.value(cur, entry, accessor.content, `${name}.script.${ext}`);
  },
  async ({ cur }, entry) => {
    await archives.get.value(cur, entry, accessor.content);
  },
);
