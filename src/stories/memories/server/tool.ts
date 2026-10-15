import { ToolProvider } from '@/tools/server';

import { memories as main } from '..';

export const tool: ToolProvider = {
  async loadArchive() {},
  async saveArchive() {},
  id: main.name,
};
