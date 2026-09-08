import { civitais } from '@/comfyui/civitai/server';

import { comfyuis as main } from '..';

import { importers } from './importers';
import { modelRepository } from './repository-model';
import { workflowRepository } from './repository-workflow';

export type * from './importers';
export const comfyuis = {
  ...main,
  importers,
  repository: {
    model: modelRepository,
    workflow: workflowRepository,
  },
};

export default async function () {
  comfyuis.importers.registry.register(civitais.importer);
}
