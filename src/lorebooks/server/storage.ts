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
    archives.set.text(cur, `${name}.content.${ext}`, item.content);
    item.content = undefined;
    return name;
  },
  async ({ cur }, entry, name) => {
    entry.content = await archives.get.fuzzy(cur, `${name}.content.`);
  },
);
