import { PresetItem } from '@/presets';
import { storages } from '@/presets/server/factory';
import { archive } from '@/utils/archive';

import { Script, scripts } from '..';

export const storage = storages.create<Script>(
  scripts,
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
      archive.text(`${name}.script.js`, item.content),
    ];
  },
  async (nodes, name) => {
    const item = archive.getJson<PresetItem<Script>>(
      nodes,
      `${name}.meta.json`,
    );
    if (item) {
      item.content = archive.get(nodes, `${name}.script.js`);
    }
    return item;
  },
);
