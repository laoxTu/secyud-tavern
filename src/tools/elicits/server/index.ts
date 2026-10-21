import { ToolProvider } from '@/tools/server';

import { elicits as main } from '..';

const provider: ToolProvider = {
  id: main.name,
};

export const elicits = {
  ...main,
  provider,
};
