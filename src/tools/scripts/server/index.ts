import { ToolProvider } from '@/tools/server';
import { Accessor, archives } from '@/utils/archive';

import { scripts as main, ScriptConfig } from '..';

type AccessorKey = 'description' | 'schema' | 'script';
const accessor: Record<AccessorKey, Accessor<ScriptConfig>> = {
  description: {
    get: (i) => i.description,
    set: (i, t) => (i.description = t),
  },
  script: {
    get: (i) => i.script,
    set: (i, t) => (i.script = t),
  },
  schema: {
    get: (i) => i.schema,
    set: (i, t) => (i.schema = t),
  },
};

const provider: ToolProvider<ScriptConfig> = {
  async loadArchive({ cur, entry: { config }, name }) {
    archives.set.value(cur, config, accessor.description, `${name}.desc.txt`);
    archives.set.value(cur, config, accessor.schema, `${name}.schema.json`);
    archives.set.value(cur, config, accessor.script, `${name}.script.js`);
  },
  async saveArchive({ cur, entry: { config } }) {
    archives.get.value(cur, config, accessor.description);
    archives.get.value(cur, config, accessor.schema);
    archives.get.value(cur, config, accessor.script);
  },
  id: main.name,
};

export const scripts = {
  ...main,
  provider,
};
