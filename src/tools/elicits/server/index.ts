import { ToolProvider } from '@/tools/server';

import { elicits as main } from '..';

const provider: ToolProvider = {
  async loadArchive() {},
  async saveArchive() {},
  id: main.name,
};

export const elicits = {
  ...main,
  provider,
};
