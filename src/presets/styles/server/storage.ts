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
  async (item, s) => {
    const name = `${item.code}-${s}`;
    return [
      archive.json(`${name}.meta.json`, {
        ...item,
        content: undefined,
      }),
      archive.text(`${name}.style.css`, item.content),
    ];
  },
  async (nodes, name) => {
    const item = archive.getJson<PresetItem<Style>>(nodes, `${name}.meta.json`);
    if (item) {
      item.content = archive.get(nodes, `${name}.style.css`);
    }
    return item;
  },
);
