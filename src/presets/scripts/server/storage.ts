import { PresetItem } from '@/presets';
import { storages } from '@/presets/server/factory';
import { archive } from '@/utils/archive';

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

    archive.set.json(cur, `${name}.meta.json`, {
      ...item,
      content: undefined,
    });
    const ext = mapToExt(item.type);
    archive.set.text(cur, `${name}.script.${ext}`, item.content);
  },
  async ({ cur }, name) => {
    const item = await archive.get.json<PresetItem<Script>>(
      cur,
      `${name}.meta.json`,
    );
    if (item) {
      item.content = await archive.get.fuzzy(cur, `${name}.script.`);
    }
    return item;
  },
);
