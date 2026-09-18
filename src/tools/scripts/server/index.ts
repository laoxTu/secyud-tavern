import { ToolProvider } from '@/tools/server';
import { archive } from '@/utils/archive';

import { scripts as main, ScriptConfig } from '..';

const provider: ToolProvider<ScriptConfig> = {
  async loadArchive({ cur, entry, name }) {
    const { description, schema, script } = entry.config;
    archive.set.text(cur, `${name}.desc.txt`, description);
    archive.set.text(cur, `${name}.schema.json`, schema);
    archive.set.text(cur, `${name}.script.js`, script);
    entry.config.description = undefined!;
    entry.config.schema = undefined!;
    entry.config.script = undefined!;
  },
  async saveArchive({ cur, entry, name }) {
    entry.config.description = await archive.get.fuzzy(cur, `${name}.desc.`);
    entry.config.schema = await archive.get.fuzzy(cur, `${name}.schema.`);
    entry.config.script = await archive.get.fuzzy(cur, `${name}.script.`);
  },
  id: main.name,
};

export const scripts = {
  ...main,
  provider,
};
