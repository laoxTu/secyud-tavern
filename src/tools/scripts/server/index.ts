import { ToolProvider } from '@/tools/server';
import { archive } from '@/utils/archive';

import { scripts as main, ScriptConfig } from '..';

const provider: ToolProvider<ScriptConfig> = {
  async loadArchive(nodes, item, name) {
    const { description, schema, script } = item.config;
    archive.set.text(nodes, `${name}.desc.txt`, description);
    archive.set.text(nodes, `${name}.schema.json`, schema);

    archive.set.text(nodes, `${name}.script.js`, script);
    item.config.description = undefined!;
    item.config.schema = undefined!;
    item.config.script = undefined!;
  },
  async saveArchive(nodes, item, name) {
    item.config.description = await archive.get.fuzzy(nodes, `${name}.desc.`);
    item.config.schema = await archive.get.fuzzy(nodes, `${name}.schema.`);
    item.config.script = await archive.get.fuzzy(nodes, `${name}.script.`);
  },
  id: main.name,
};

export const scripts = {
  ...main,
  provider,
};
