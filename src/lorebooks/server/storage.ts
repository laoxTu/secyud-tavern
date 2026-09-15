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
  async (nodes, item, s) => {
    const name = `${item.code}-${s}`;
    const ext = lorebooks.typeToExt(item.type);

    archive.set.json(nodes, `${name}.meta.json`, {
      ...item,
      content: undefined,
    });
    archive.set.text(nodes, `${name}.content.${ext}`, item.content);
  },
  async (nodes, name) => {
    const item = await archive.get.json<PresetItem<Lorebook>>(
      nodes,
      `${name}.meta.json`,
    );
    if (item) {
      item.content = await archive.get.fuzzy(nodes, `${name}.content.`);
    }
    return item;
  },
);
