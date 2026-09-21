import { ToolProvider } from '@/tools/server';
import { archives } from '@/utils/archive';

import { scripts as main, ScriptConfig } from '..';

const provider: ToolProvider<ScriptConfig> = {
  async loadArchive({ cur, entry, name }) {
    const { description, schema, script } = entry.config;
    archives.set.text(cur, `${name}.desc.txt`, description);
    archives.set.text(cur, `${name}.schema.json`, schema);
    archives.set.text(cur, `${name}.script.js`, script);
    entry.config.description = undefined!;
    entry.config.schema = undefined!;
    entry.config.script = undefined!;
  },
  async saveArchive({ cur, entry, name }) {
    entry.config.description = await archives.get.fuzzy(cur, `${name}.desc.`);
    entry.config.schema = await archives.get.fuzzy(cur, `${name}.schema.`);
    entry.config.script = await archives.get.fuzzy(cur, `${name}.script.`);
  },
  id: main.name,
};

export const scripts = {
  ...main,
  provider,
};
