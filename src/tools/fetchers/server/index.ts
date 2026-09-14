import { ToolProvider } from '@/tools/server';

import { FetchConfig, fetchers as main } from '..';

const provider: ToolProvider<FetchConfig> = {
  async loadArchive() {
    return [];
  },
  async saveArchive() {},
  id: main.name,
};

export const fetchers = {
  ...main,
  provider,
};
