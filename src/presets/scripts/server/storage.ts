import { storages } from '@/presets/server/factory';
import { archives } from '@/utils/archive';

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
export const storage = storages.create<Script>(
  scripts,
  ({ name, data: { code, type, priority } }) => ({
    sorter: `${name}${code}`,
    filter: `${type}${String(priority).padStart(5, '0')}${name}`,
  }),
  async ({ cur }, entry, s) => {
    const name = `${entry.code}-${s}`;
    const ext = mapToExt(entry.type);
    archives.set.text(cur, `${name}.script.${ext}`, entry.content);
    entry.content = undefined;
    return name;
  },
  async ({ cur }, entry, name) => {
    entry.content = await archives.get.fuzzy(cur, `${name}.script.`);
  },
);
