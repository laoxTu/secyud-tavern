import { models } from '@/models/server';
import { ToolProvider } from '@/tools/server';
import { Accessor, archives } from '@/utils/archive';

import { AgentConfig, agents as main } from '..';

type AccessorKey = 'description' | 'schema';
const accessor: Record<AccessorKey, Accessor<AgentConfig>> = {
  description: {
    get: (i) => i.description,
    set: (i, t) => (i.description = t),
  },
  schema: {
    get: (i) => i.schema,
    set: (i, t) => (i.schema = t),
  },
};
const provider: ToolProvider<AgentConfig> = {
  async loadArchive(ctx) {
    const {
      cur,
      entry: { config },
      name,
      append,
    } = ctx;
    archives.set.value(cur, config, accessor.description, `${name}.desc.txt`);
    archives.set.value(cur, config, accessor.schema, `${name}.schema.json`);

    models.storage.export(ctx, config.model?.value);
    const presets = config.presets;
    if (presets.length) {
      for (const item of presets) {
        append(item.value);
      }
    }
  },
  async saveArchive(ctx) {
    const {
      cur,
      entry: { config },
    } = ctx;
    archives.get.value(cur, config, accessor.description);
    archives.get.value(cur, config, accessor.schema);
    models.storage.import(ctx, config.model?.value);
  },
  id: main.name,
};

export const agents = {
  ...main,
  provider,
};
