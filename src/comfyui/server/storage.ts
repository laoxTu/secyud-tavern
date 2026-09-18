import { eq } from 'drizzle-orm';

import { utils } from '@/database';
import { PresetArchiveContext } from '@/presets/server/storage';
import { Archive, archive, ArchiveFolder } from '@/utils/archive';

import { ComfyUIPortModel } from '..';

import { workflowRepository } from './repository-workflow';

interface ComfyUIStoreCache {
  workflows: Set<string>;
}

function comfyuiFolder(root: Archive): ArchiveFolder {
  return (root['comfyui'] ??= {
    type: 'folder',
    name: 'comfyui',
    nodes: {},
  }) as ArchiveFolder;
}

export const storage = {
  async export({ properties, root }: PresetArchiveContext, id?: string | null) {
    const comfyuis = utils.get<ComfyUIStoreCache>(
      properties!,
      'comfyui',
      () => ({
        workflows: new Set(),
      }),
    );
    if (!id || comfyuis.workflows.has(id)) return;

    const folder = comfyuiFolder(root);

    const workflow = await workflowRepository.get(id);
    const params = await workflowRepository.param.list(id);
    archive.set.text(folder.nodes, `${id}.workflow.json`, workflow.content);
    workflow.content = undefined;
    archive.set.json(folder.nodes, `${id}.comfyui.json`, {
      params,
      workflow,
    });
  },
  async import({ properties, root }: PresetArchiveContext, id?: string | null) {
    const comfyuis = utils.get<ComfyUIStoreCache>(
      properties!,
      'comfyui',
      () => ({
        workflows: new Set(),
      }),
    );
    if (!id || comfyuis.workflows.has(id)) return;
    const folder = comfyuiFolder(root);

    const comfyui = await archive.get.json<ComfyUIPortModel>(
      folder.nodes,
      `${id}.comfyui.json`,
    );
    if (comfyui) {
      const { workflow, params } = comfyui;
      workflow.content = await archive.get.fuzzy(
        folder.nodes,
        `${id}.workflow.`,
      );
      const exist = await workflowRepository.exist((t) =>
        eq(t.id, workflow.id),
      );
      if (exist) {
        await workflowRepository.delete(workflow.id);
      }
      await workflowRepository.create(workflow);
      await workflowRepository.param.make(workflow.id, params);
    }
  },
};
