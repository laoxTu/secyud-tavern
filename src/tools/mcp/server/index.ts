import { ToolProvider } from '@/tools/server';

import { mcp as main } from '..';

const provider: ToolProvider = {
  async loadArchive() {},
  async saveArchive() {},
  id: main.name,
};

export const mcp = {
  ...main,
  provider,
};
