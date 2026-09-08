import { presets } from '@/presets/server';

import { tools as main } from '..';

import { storage } from './storage';

export const tools = {
  ...main,
  storage: {
    preset: storage,
  },
};

export default async function () {
  presets.storage.registry.register(storage);
}
