import { presets } from '@/presets/server';

import { lorebooks as main } from '..';

import { storage } from './storage';

export const lorebooks = {
  ...main,
  storage: {
    preset: storage,
  },
};

export default async function () {
  presets.storage.registry.register(storage);
}
