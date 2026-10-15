'use client';
import { utils } from '@/database';
import { models } from '@/models/client';
import { Realm, RealmOutput } from '@/stories';

import { lorebooks as main } from '..';

import { tab } from './content';
import { matchers } from './matcher';
import { LorebookCache, processer } from './realm';
import { tool } from './tool';

export type * from './matcher';

export const lorebooks = {
  ...main,
  matchers,
  processer,
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
