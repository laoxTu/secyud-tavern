'use client';
import { utils } from '@/database';
import { models } from '@/models/client';
import { Realm, RealmOutput } from '@/stories';

import { lorebooks as main } from '..';

import { builders } from './builder';
import { tab } from './content';
import { LorebookCache, processer } from './realm';
import { tool } from './tool';

export type * from './realm';
export const lorebooks = {
  ...main,
  processer,
  builders,
  tab: {
    preset: tab,
  },
  cache(realm: Realm) {
    return models.cache<LorebookCache>(realm, main.name);
  },
  codes(message: RealmOutput, create: boolean = true): string[][] | undefined {
    return create
      ? utils.getProperty(message, 'lorebook_vector', (): string[][] => [])
      : utils.getProperty(message, 'lorebook_vector');
  },
  tool,
};
