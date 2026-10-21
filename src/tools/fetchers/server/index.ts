import { ToolProvider } from '@/tools/server';

import { FetchConfig, fetchers as main } from '..';

const provider: ToolProvider<FetchConfig> = {
  id: main.name,
};

export const fetchers = {
  ...main,
  provider,
};
