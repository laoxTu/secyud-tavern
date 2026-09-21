import { PresetItem } from '@/presets';
import { storages } from '@/presets/server/factory';
import { archives } from '@/utils/archive';

import { Script, scripts } from '..';

function mapToExt(type: string | null) {
  switch (type) {
    case 'link':
      return 'txt';
    case 'importmap':
      return 'json';
    default:
      return 'js';
  }
}
export const storage = storages.create<Script>(
  scripts,
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
    const ext = mapToExt(item.type);
    archives.set.text(cur, `${name}.script.${ext}`, item.content);
  },
  async ({ cur }, name) => {
    const item = await archives.get.json<PresetItem<Script>>(
      cur,
      `${name}.meta.json`,
    );
    if (item) {
      item.content = await archives.get.fuzzy(cur, `${name}.script.`);
    }
    return item;
  },
);
