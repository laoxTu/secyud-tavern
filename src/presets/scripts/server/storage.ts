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
  async (nodes, item, s) => {
    const name = `${item.code}-${s}`;

    archive.set.json(nodes, `${name}.meta.json`, {
      ...item,
      content: undefined,
    });
    const ext = mapToExt(item.type);
    archive.set.text(nodes, `${name}.script.${ext}`, item.content);
  },
  async (nodes, name) => {
    const item = await archive.get.json<PresetItem<Script>>(
      nodes,
      `${name}.meta.json`,
    );
    if (item) {
      item.content = await archive.get.fuzzy(nodes, `${name}.script.`);
    }
    return item;
  },
);
