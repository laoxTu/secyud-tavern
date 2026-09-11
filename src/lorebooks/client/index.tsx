'use client';
import { models } from '@/models/client';
import { presets } from '@/presets/client';

import { lorebooks as main } from '..';

import { tab } from './content';
import { matchers } from './matcher';
import { alwaysMatcher } from './matchers/always';
import { eventMatcher } from './matchers/event';
import { normalMatcher } from './matchers/normal';
import { variableMatcher } from './matchers/variable';
import { vectorMatcher } from './matchers/vector';
import { processer } from './realm';

export type * from './matcher';

export const lorebooks = {
  ...main,
  matchers,
  processer,
  tab: {
    preset: tab,
  },
};

export default async function () {
  models.processers.registry.register(lorebooks.processer);

  presets.tabs.register(lorebooks.tab.preset);

  matchers.registry.register(
    vectorMatcher,
    alwaysMatcher,
    normalMatcher,
    eventMatcher,
    variableMatcher,
  );
}
