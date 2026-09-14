import { presets } from '@/presets/server';

import { tools as main } from '..';
import { agents } from '../agents/server';
import { fetchers } from '../fetchers/server';
import { scripts } from '../scripts/server';
import { variables } from '../variables/server';

import { providers } from './providers';
import { storage } from './storage';

export type * from './providers';

export const tools = {
  ...main,
  providers,
  storage: {
    preset: storage,
  },
};

export default async function () {
  presets.storage.registry.register(storage);

  tools.providers.registry.register(
    variables.provider,
    fetchers.provider,
    scripts.provider,
    agents.provider,
  );
}
