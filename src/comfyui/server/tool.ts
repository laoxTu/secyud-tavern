import { ToolProvider } from '@/tools/server';
import { archives } from '@/utils/archive';

import { AutoPaintConfig, comfyuis as main } from '..';

import { storage } from './storage';

export const provider: ToolProvider<AutoPaintConfig> = {
  async loadArchive(ctx) {
    const { cur, entry, name } = ctx;
    const { description } = entry.config;
    archives.set.text(cur, `${name}.desc.txt`, description);
    entry.config.description = undefined!;

    await storage.export(ctx, entry.config.workflow?.value);
  },
  async saveArchive(ctx) {
    const { cur, entry, name } = ctx;
    entry.config.description = await archives.get.fuzzy(cur, `${name}.desc.`);
    await storage.import(ctx, entry.config.workflow?.value);
  },
  id: main.name,
};
