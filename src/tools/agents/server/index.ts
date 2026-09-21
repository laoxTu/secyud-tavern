import { models } from '@/models/server';
import { ToolProvider } from '@/tools/server';
import { archives } from '@/utils/archive';

import { AgentConfig, agents as main } from '..';

const provider: ToolProvider<AgentConfig> = {
  async loadArchive(ctx) {
    const { cur, entry, name, append } = ctx;
    const { description, schema } = entry.config;
    archives.set.text(cur, `${name}.desc.txt`, description);
    archives.set.text(cur, `${name}.schema.json`, schema);
    entry.config.description = undefined!;
    entry.config.schema = undefined!;

    models.storage.export(ctx, entry.config.model?.value);
    const presets = entry.config.presets;
    if (presets.length) {
      for (const item of presets) {
        append(item.value);
      }
    }
  },
  async saveArchive(ctx) {
    const { cur, entry, name } = ctx;
    entry.config.description = await archives.get.fuzzy(cur, `${name}.desc.`);
    entry.config.schema = await archives.get.fuzzy(cur, `${name}.schema.`);
    models.storage.import(ctx, entry.config.model?.value);
  },
  id: main.name,
};

export const agents = {
  ...main,
  provider,
};
