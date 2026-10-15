'use client';
import { globals, settings } from '@/global/client';
import { models } from '@/models/client';
import { features } from '@/stories/client/feature';
import { renderers } from '@/stories/client/renderer';
import { images } from '@/stories/images/client';
import { feature } from '@/stories/realms/client/feature';
import { tools } from '@/tools/client';

import { stories as main } from '..';
import { memories, rags } from '../memories/client';
import { transformers } from '../memories/client/transformer';

import { menu, property, tabs } from './content';
import { proxy } from './proxy';

export * from './component';
export type * from './content';
export type * from './feature';
export type * from './renderer';
export * from './state';
export const stories = {
  ...main,
  proxy,
  tabs,
  renderers,
  features,
  menu,
  feature,
  property,
};

export default async function () {
  globals.menus.register(stories.menu);
  tabs.register(stories.property, images.tab.story);
  stories.features.registry.register(...stories.feature, images.feature);
  settings.tabs.register(memories.setting);
  rags.registry.register(transformers.embedder);
  tools.providers.registry.register(memories.tool);
  stories.tabs.register(memories.tabs.story);
  models.processers.registry.register(memories.processer);
}
