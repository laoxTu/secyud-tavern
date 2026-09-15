import { ToolProvider } from '@/tools/server';

import { variables as main } from '..';

const provider: ToolProvider = {
  async loadArchive() {},
  async saveArchive() {},
  id: main.name,
};

export const variables = {
  ...main,
  provider,
};
