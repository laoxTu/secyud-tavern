import { PresetItem } from '@/presets';
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

    archives.set.json(cur, `${name}.meta.json`, {
      ...item,
      content: undefined,
    });
    const ext = item.type === 'link' ? 'txt' : 'css';
    archives.set.text(cur, `${name}.style.${ext}`, item.content);
  },
  async ({ cur }, name) => {
    const item = await archives.get.json<PresetItem<Style>>(
      cur,
      `${name}.meta.json`,
    );
    if (item) {
      item.content = await archives.get.fuzzy(cur, `${name}.style.`);
    }
    return item;
  },
);
