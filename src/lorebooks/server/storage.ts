import { PresetItem } from '@/presets';
import { storages } from '@/presets/server/factory';
import { archives } from '@/utils/archive';

import { Lorebook, lorebooks } from '..';

export const storage = storages.create<Lorebook>(
  lorebooks,
  ({ name, data: { code, match } }) => ({
    sorter: `${match}${code}${name}`,
    filter: `${match}${code}${name}`,
  }),
  async ({ cur }, item, s) => {
    const name = `${item.code}-${s}`;
    const ext = lorebooks.typeToExt(item.type);

    archives.set.json(cur, `${name}.meta.json`, {
      ...item,
      content: undefined,
    });
    archives.set.text(cur, `${name}.content.${ext}`, item.content);
  },
  async ({ cur }, name) => {
    const item = await archives.get.json<PresetItem<Lorebook>>(
      cur,
      `${name}.meta.json`,
    );
    if (item) {
      item.content = await archives.get.fuzzy(cur, `${name}.content.`);
    }
    return item;
  },
);
