import { presets } from '@/presets/server';
import { tools } from '@/tools/server';

import { lorebooks as main } from '..';

import { provider } from './provider';
import { storage } from './storage';

export const lorebooks = {
  ...main,
  storage: {
    preset: storage,
  },
  provider,
};

export default async function () {
  tools.providers.registry.register(provider);
  presets.storage.registry.register(storage);
}
