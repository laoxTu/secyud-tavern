import { eq } from 'drizzle-orm';

import { utils } from '@/database';
import { PresetArchiveContext } from '@/presets/server/storage';
import { Archive, archive, ArchiveFolder } from '@/utils/archive';

import { Model } from '..';

import { repository } from './repository';

interface ModelStoreCache {
  models: Set<string>;
}

function modelFolder(root: Archive): ArchiveFolder {
  return (root['model'] ??= {
    type: 'folder',
    name: 'model',
    nodes: {},
  }) as ArchiveFolder;
}

export const storage = {
  async export({ properties, root }: PresetArchiveContext, id?: string | null) {
    const cache = utils.get<ModelStoreCache>(properties!, 'comfyui', () => ({
      models: new Set(),
    }));
    if (!id || cache.models.has(id)) return;
    const folder = modelFolder(root);
    const model = await repository.get(id);
    archive.set.json(folder.nodes, `${id}.model.json`, model);
  },
  async import({ properties, root }: PresetArchiveContext, id?: string | null) {
    const cache = utils.get<ModelStoreCache>(properties!, 'comfyui', () => ({
      models: new Set(),
    }));
    if (!id || cache.models.has(id)) return;
    const folder = modelFolder(root);

    const model = await archive.get.json<Model>(
      folder.nodes,
      `${id}.model.json`,
    );
    if (!model) return;

    const exist = await repository.exist((t) => eq(t.id, model.id));
    if (exist) {
      await repository.delete(model.id);
    }
    await repository.create(model);
  },
};
