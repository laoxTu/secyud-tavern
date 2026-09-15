import { ToolProvider } from '@/tools/server';
import { archive } from '@/utils/archive';

import { AgentConfig, agents as main } from '..';

const provider: ToolProvider<AgentConfig> = {
  async loadArchive(nodes, item, name) {
    const { description, schema } = item.config;
    archive.set.text(nodes, `${name}.desc.txt`, description);
    archive.set.text(nodes, `${name}.schema.json`, schema);
    item.config.description = undefined!;
    item.config.schema = undefined!;
  },
  async saveArchive(nodes, item, name) {
    item.config.description = await archive.get.text(nodes, `${name}.desc.txt`);
    item.config.schema = await archive.get.text(nodes, `${name}.schema.json`);
  },
  id: main.name,
};

export const agents = {
  ...main,
  provider,
};
