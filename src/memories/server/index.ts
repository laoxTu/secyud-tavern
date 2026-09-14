import { stories } from '@/stories/server';
import { tools } from '@/tools/server';

import { memories as main } from '..';

import { provider } from './provider';
import { storage } from './storage';

export const memories = {
  ...main,
  storage: {
    story: storage,
  },
  provider,
};

export default async function () {
  stories.storage.registry.register(storage);
  tools.providers.registry.register(provider);
}
