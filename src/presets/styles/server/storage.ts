import { PresetItem } from '@/presets';
import { storages } from '@/presets/server/factory';
import { archive } from '@/utils/archive';

import { Style, styles } from '..';

export const storage = storages.create<Style>(
  styles,
  ({ name, data: { code, type, priority } }) => ({
    sorter: `${name}${code}`,
    filter: `${type}${String(priority).padStart(5, '0')}${name}`,
  }),
  async (nodes, item, s) => {
    const name = `${item.code}-${s}`;

    archive.set.json(nodes, `${name}.meta.json`, {
      ...item,
      content: undefined,
    });
    const ext = item.type === 'link' ? 'txt' : 'css';
    archive.set.text(nodes, `${name}.style.${ext}`, item.content);
  },
  async (nodes, name) => {
    const item = await archive.get.json<PresetItem<Style>>(
      nodes,
      `${name}.meta.json`,
    );
    if (item) {
      item.content = await archive.get.fuzzy(nodes, `${name}.style.`);
    }
    return item;
  },
);
