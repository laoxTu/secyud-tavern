import { ToolProvider } from '@/tools/server';

import { variables as main } from '..';

const provider: ToolProvider = {
  async loadArchive() {
    return [];
  },
  async saveArchive() {},
  id: main.name,
};

export const variables = {
  ...main,
  provider,
};
