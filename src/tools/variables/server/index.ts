import { ToolProvider } from '@/tools/server';

import { variables as main } from '..';

const provider: ToolProvider = {
  id: main.name,
};

export const variables = {
  ...main,
  provider,
};
