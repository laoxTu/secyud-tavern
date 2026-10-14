import { storages } from '@/presets/server/factory';
import { archives } from '@/utils/archive';

import { Style, styles } from '..';

export const storage = storages.create<Style>(
  styles,
  ({ name, data: { code, type, priority } }) => ({
    sorter: `${name}${code}`,
    filter: `${type}${String(priority).padStart(5, '0')}${name}`,
  }),
  async ({ cur }, item, s) => {
    const name = `${item.code}-${s}`;
    const ext = item.type === 'link' ? 'txt' : 'css';
    archives.set.text(cur, `${name}.style.${ext}`, item.content);
    item.content = undefined;
    return name;
  },
  async ({ cur }, entry, name) => {
    entry.content = await archives.get.fuzzy(cur, `${name}.style.`);
  },
);
