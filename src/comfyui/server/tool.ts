import { ToolProvider } from '@/tools/server';
import { archive } from '@/utils/archive';

import { AutoPaintConfig, comfyuis as main } from '..';

export const provider: ToolProvider<AutoPaintConfig> = {
  async loadArchive(nodes, item, name) {
    const { description } = item.config;
    archive.set.text(nodes, `${name}.desc.txt`, description);
    item.config.description = undefined!;
  },
  async saveArchive(nodes, item, name) {
    item.config.description = await archive.get.fuzzy(nodes, `${name}.desc.`);
  },
  id: main.name,
};
