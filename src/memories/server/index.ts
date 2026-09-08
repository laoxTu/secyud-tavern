import { stories } from '@/stories/server';

import { memories as main } from '..';

import { storage } from './storage';

export const memories = {
  ...main,
  storage: {
    story: storage,
  },
};

export default async function () {
  stories.storage.registry.register(storage);
}
