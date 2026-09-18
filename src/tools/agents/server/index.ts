import { eq } from 'drizzle-orm';

import { Model } from '@/models';
import { models } from '@/models/server';
import { presets } from '@/presets/server';
import { ToolProvider } from '@/tools/server';
import { archive } from '@/utils/archive';

import { AgentConfig, agents as main } from '..';

const provider: ToolProvider<AgentConfig> = {
  async loadArchive({ cur, entry, name, root }) {
    const { description, schema } = entry.config;
    archive.set.text(cur, `${name}.desc.txt`, description);
    archive.set.text(cur, `${name}.schema.json`, schema);
    entry.config.description = undefined!;
    entry.config.schema = undefined!;

    const id = entry.config.model?.value;
    if (id) {
      const model = await models.repository.get(id);
      archive.set.json(cur, `${name}.model.json`, model);
    }
    const codes = entry.config.presets.map((u) => u.value);
    if (codes.length) {
      const source = await presets.repository.listWithRequires(codes, {
        entities: true,
      });
      for (const item of source) {
        const node = await presets.storage.load(root, item);
        if (node) root[item.id] = node;
      }
    }
  },
  async saveArchive({ cur, entry, name }) {
    entry.config.description = await archive.get.fuzzy(cur, `${name}.desc.`);
    entry.config.schema = await archive.get.fuzzy(cur, `${name}.schema.`);
    const model = await archive.get.json<Model>(cur, `${name}.model.json`);
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
