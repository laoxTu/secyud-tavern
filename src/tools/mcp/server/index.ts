import { ToolProvider } from '@/tools/server';

import { mcp as main } from '..';

const provider: ToolProvider = {
  id: main.name,
};

export const mcp = {
  ...main,
  provider,
};
