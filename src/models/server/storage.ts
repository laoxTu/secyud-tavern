import { eq } from 'drizzle-orm';

import { utils } from '@/database';
import { PresetArchiveContext } from '@/presets/server/storage';
import { Archive, archive, ArchiveFolder } from '@/utils/archive';

import { Model } from '..';

import { repository } from './repository';

interface ModelStoreCache {
  models: Set<string>;
}

function folder(root: Archive): ArchiveFolder {
  return (root['model'] ??= {
    type: 'folder',
    name: 'model',
    nodes: {},
  }) as ArchiveFolder;
}

function check(ctx: PresetArchiveContext, id: string) {
  const { models } = utils.getProperty<ModelStoreCache>(ctx, 'models', () => ({
    models: new Set(),
  }));
  if (models.has(id)) return false;
  models.add(id);
  return true;
}

export const storage = {
  async export(ctx: PresetArchiveContext, id?: string | null) {
    if (!id || !check(ctx, id)) return;
    const node = folder(ctx.root);
    const model = await repository.get(id);
    archive.set.json(node.nodes, `${id}.model.json`, model);
  },
  async import(ctx: PresetArchiveContext, id?: string | null) {
    if (!id || !check(ctx, id)) return;
    const node = folder(ctx.root);

    const model = await archive.get.json<Model>(node.nodes, `${id}.model.json`);
    if (!model) return;

    const exist = await repository.exist((t) => eq(t.id, model.id));
    if (exist) {
      await repository.delete(model.id);
    }
    await repository.create(model);
  },
};
