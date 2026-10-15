'use client';
import { utils } from '@/database';
import { models } from '@/models/client';
import { Realm, RealmOutput } from '@/stories';

import { memories as main } from '..';

import { storyTab } from './content';
import { MemoryCache, processer } from './realm';
import { setting } from './setting';
import { tool } from './tool';

export * from './rag';

export const memories = {
  ...main,
  setting,
  codes(message: RealmOutput, create: boolean = true): number[][] | undefined {
    return create
      ? utils.getProperty(message, 'memory', (): number[][] => [])
      : utils.getProperty(message, 'memory');
  },
  cache(realm: Realm) {
    return models.cache<MemoryCache>(realm, main.name);
  },
  tabs: {
    story: storyTab,
  },
  tool,
  processer,
};
