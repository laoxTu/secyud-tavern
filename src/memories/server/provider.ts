import { ToolProvider } from '@/tools/server';

import { memories as main } from '..';

export const provider: ToolProvider = {
  async loadArchive() {
    return [];
  },
  async saveArchive() {},
  id: main.name,
};
