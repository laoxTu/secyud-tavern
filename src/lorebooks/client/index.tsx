'use client';
import { utils } from '@/database';
import { models } from '@/models/client';
import { presets } from '@/presets/client';
import { Realm, RealmOutput } from '@/stories';
import { tools } from '@/tools/client';

import { lorebooks as main } from '..';

import { tab } from './content';
import { matchers } from './matcher';
import { alwaysMatcher } from './matchers/always';
import { eventMatcher } from './matchers/event';
import { normalMatcher } from './matchers/normal';
import { variableMatcher } from './matchers/variable';
import { vectorMatcher } from './matchers/vector';
import { LorebookCache, processer } from './realm';
import { provider } from './tool';

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
  tool: provider,
};

export default async function () {
  models.processers.registry.register(lorebooks.processer);

  presets.tabs.register(lorebooks.tab.preset);

  tools.providers.registry.register(provider);

  matchers.registry.register(
    vectorMatcher,
    alwaysMatcher,
    normalMatcher,
    eventMatcher,
    variableMatcher,
  );
}
