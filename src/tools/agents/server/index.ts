import { eq } from 'drizzle-orm';

import { Model } from '@/models';
import { models } from '@/models/server';
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

    const id = item.config.model?.value;
    if (id) {
      const model = await models.repository.get(id);
      archive.set.json(nodes, `${name}.model.json`, model);
    }
  },
  async saveArchive(nodes, item, name) {
    item.config.description = await archive.get.fuzzy(nodes, `${name}.desc.`);
    item.config.schema = await archive.get.fuzzy(nodes, `${name}.schema.`);
    const model = await archive.get.json<Model>(nodes, `${name}.model.json`);
    if (model) {
      const exist = await models.repository.exist((t) => eq(t.id, model.id));
      if (exist) {
        await models.repository.delete(model.id);
      }
      await models.repository.create(model);
    }
  },
  id: main.name,
};

export const agents = {
  ...main,
  provider,
};
