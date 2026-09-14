import { PresetItem } from '@/presets';
import { storages } from '@/presets/server/factory';
import { archive } from '@/utils/archive';

import { Macro, macros } from '..';

export const storage = storages.create<Macro>(
  macros,
  ({ name, data: { key, multiple, hidden } }) => ({
    sorter: `${key}${+multiple}${+hidden}`,
    filter: `${key}${name}`,
  }),
  async (item, s) => {
    const name = `${item.code}-${s}`;
    const ext = item.json ? 'json' : 'txt';
    return [
      archive.json(`${name}.meta.json`, {
        ...item,
        content: undefined,
      }),
      archive.text(`${name}.value.${ext}`, item.value),
    ];
  },
  async (nodes, name) => {
    const item = archive.getJson<PresetItem<Macro>>(nodes, `${name}.meta.json`);
    if (item) {
      const ext = item.json ? 'json' : 'txt';
      item.value = archive.get(nodes, `${name}.value.${ext}`);
    }
    return item;
  },
);
