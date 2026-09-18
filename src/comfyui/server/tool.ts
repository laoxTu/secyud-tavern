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
  async loadArchive({ cur, entry, name }) {
    const { description } = entry.config;
    archive.set.text(cur, `${name}.desc.txt`, description);
    entry.config.description = undefined!;

    const id = entry.config.workflow?.value;
    if (id) {
      const workflow = await workflowRepository.get(id);
      const params = await workflowRepository.param.list(id);
      archive.set.text(cur, `${name}.workflow.json`, workflow.content);
      workflow.content = undefined;
      archive.set.json(cur, `${name}.comfyui.json`, { params, workflow });
    }
  },
  async saveArchive({ cur, entry, name }) {
    entry.config.description = await archive.get.fuzzy(cur, `${name}.desc.`);
    const comfyui = await archive.get.json<{
      workflow: ComfyUIWorkflow;
      params: ComfyUIParam[];
    }>(cur, `${name}.comfyui.json`);
    if (comfyui) {
      const { workflow, params } = comfyui;
      workflow.content = await archive.get.fuzzy(cur, `${name}.workflow.`);
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
