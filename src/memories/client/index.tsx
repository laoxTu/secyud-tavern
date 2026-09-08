import { utils } from '@/database';
import { settings } from '@/global/client';
import { models } from '@/models/client';
import { Realm, RealmOutput } from '@/stories';
import { stories } from '@/stories/client';
import { tools } from '@/tools/client';

import { memories as main } from '..';

import { storyTab } from './content';
import { MemoryCache, processer } from './processer';
import { rags } from './rag';
import { setting } from './setting';
import { provider } from './tool';
import { transformers } from './transformer';

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
  processer,
};

export default async function () {
  settings.tabs.register(setting);
  rags.registry.register(transformers.embedder);
  tools.providers.registry.register(provider);
  stories.tabs.register(storyTab);
  models.processers.registry.register(memories.processer);
}
