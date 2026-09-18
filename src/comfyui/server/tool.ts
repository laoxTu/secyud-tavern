import { eq } from 'drizzle-orm';

import { ToolProvider } from '@/tools/server';
import { archive } from '@/utils/archive';

import {
  AutoPaintConfig,
  ComfyUIParam,
  ComfyUIWorkflow,
  comfyuis as main,
} from '..';

import { workflowRepository } from './repository-workflow';

export const provider: ToolProvider<AutoPaintConfig> = {
  async loadArchive(nodes, item, name) {
    const { description } = item.config;
    archive.set.text(nodes, `${name}.desc.txt`, description);
    item.config.description = undefined!;

    const id = item.config.workflow?.value;
    if (id) {
      const workflow = await workflowRepository.get(id);
      const params = await workflowRepository.param.list(id);
      archive.set.text(nodes, `${name}.workflow.json`, workflow.content);
      workflow.content = undefined;
      archive.set.json(nodes, `${name}.comfyui.json`, { params, workflow });
    }
  },
  async saveArchive(nodes, item, name) {
    item.config.description = await archive.get.fuzzy(nodes, `${name}.desc.`);
    const comfyui = await archive.get.json<{
      workflow: ComfyUIWorkflow;
      params: ComfyUIParam[];
    }>(nodes, `${name}.comfyui.json`);
    if (comfyui) {
      const { workflow, params } = comfyui;
      workflow.content = await archive.get.fuzzy(nodes, `${name}.workflow.`);
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
  id: main.name,
};
