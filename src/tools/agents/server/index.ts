import { ToolProvider } from '@/tools/server';
import { archive } from '@/utils/archive';

import { AgentConfig, agents as main } from '..';

const provider: ToolProvider<AgentConfig> = {
  async loadArchive(item, name) {
    const res = [
      archive.text(`${name}.desc.txt`, item.config.description),
      archive.text(`${name}.schema.json`, item.config.schema),
    ];

    item.config.description = undefined!;
    item.config.schema = undefined!;

    return res;
  },
  async saveArchive(nodes, item, name) {
    item.config.description = archive.get(nodes, `${name}.desc.txt`);
    item.config.schema = archive.get(nodes, `${name}.schema.json`);
  },
  id: main.name,
};

export const agents = {
  ...main,
  provider,
};
