import { ToolProvider } from '@/tools/server';
import { Accessor, archives } from '@/utils/archive';

import { AutoPaintConfig, comfyuis as main } from '..';

import { storage } from './storage';

type AccessorKey = 'description';
const accessor: Record<AccessorKey, Accessor<AutoPaintConfig>> = {
  description: {
    get: (i) => i.description,
    set: (i, t) => (i.description = t),
  },
};
export const provider: ToolProvider<AutoPaintConfig> = {
  async loadArchive(ctx) {
    const {
      cur,
      entry: { config },
      name,
    } = ctx;
    archives.set.value(cur, config, accessor.description, `${name}.desc.txt`);
    await storage.export(ctx, config.workflow?.value);
  },
  async saveArchive(ctx) {
    const {
      cur,
      entry: { config },
    } = ctx;
    archives.get.value(cur, config, accessor.description);
    await storage.import(ctx, config.workflow?.value);
  },
  id: main.name,
};
