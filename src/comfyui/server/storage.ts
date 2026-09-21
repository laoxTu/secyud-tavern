import { eq } from 'drizzle-orm';

import { utils } from '@/database';
import { PresetArchiveContext } from '@/presets/server/storage';
import { Archive, archive, ArchiveFolder } from '@/utils/archive';

import { ComfyUIPaint } from '..';

import { workflowRepository } from './repository-workflow';

interface ComfyUIStoreCache {
  workflows: Set<string>;
}

function folder(root: Archive): ArchiveFolder {
  return (root['comfyui'] ??= {
    type: 'folder',
    name: 'comfyui',
    nodes: {},
  }) as ArchiveFolder;
}

function check(ctx: PresetArchiveContext, id: string) {
  const { workflows } = utils.getProperty<ComfyUIStoreCache>(
    ctx,
    'comfyui',
    () => ({
      workflows: new Set(),
    }),
  );
  if (workflows.has(id)) return false;
  workflows.add(id);
  return true;
}

export const storage = {
  folder,
  async export(ctx: PresetArchiveContext, id?: string | null) {
    if (!id || !check(ctx, id)) return;
    const node = folder(ctx.root);
    const workflow = await workflowRepository.get(id);
    const params = await workflowRepository.param.list(id);
    archive.set.text(node.nodes, `${id}.workflow.json`, workflow.content);
    workflow.content = undefined;
    archive.set.json(node.nodes, `${id}.comfyui.json`, {
      params: params.items,
      workflow,
    });
  },
  async import(ctx: PresetArchiveContext, id?: string | null) {
    if (!id || !check(ctx, id)) return;
    const node = folder(ctx.root);
    const comfyui = await archive.get.json<ComfyUIPaint>(
      node.nodes,
      `${id}.comfyui.json`,
    );
    if (comfyui) {
      const { workflow, params } = comfyui;
      workflow.content = await archive.get.fuzzy(node.nodes, `${id}.workflow.`);
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
