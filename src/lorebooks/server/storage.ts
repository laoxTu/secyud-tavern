import { PresetItem } from '@/presets';
import { storages } from '@/presets/server/factory';
import { archive } from '@/utils/archive';

import { Lorebook, lorebooks } from '..';

export const storage = storages.create<Lorebook>(
  lorebooks,
  ({ name, data: { code, match } }) => ({
    sorter: `${match}${code}${name}`,
    filter: `${match}${code}${name}`,
  }),
  async (item, s) => {
    const name = `${item.code}-${s}`;
    const ext = lorebooks.typeToExt(item.type);
    return [
      archive.json(`${name}.meta.json`, {
        ...item,
        content: undefined,
      }),
      archive.text(`${name}.content.${ext}`, item.content),
    ];
  },
  async (nodes, name) => {
    const item = archive.getJson<PresetItem<Lorebook>>(
      nodes,
      `${name}.meta.json`,
    );
    if (item) {
      const ext = lorebooks.typeToExt(item.type);
      item.content = archive.get(nodes, `${name}.content.${ext}`);
    }
    return item;
  },
);
