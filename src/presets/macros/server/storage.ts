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
  async (nodes, item, s) => {
    const name = `${item.code}-${s}`;
    const ext = item.json ? 'json' : 'txt';

    archive.set.json(nodes, `${name}.meta.json`, {
      ...item,
      content: undefined,
    });
    archive.set.text(nodes, `${name}.value.${ext}`, item.value);
  },
  async (nodes, name) => {
    const item = await archive.get.json<PresetItem<Macro>>(
      nodes,
      `${name}.meta.json`,
    );
    if (item) {
      const ext = item.json ? 'json' : 'txt';
      item.value = await archive.get.text(nodes, `${name}.value.${ext}`);
    }
    return item;
  },
);
