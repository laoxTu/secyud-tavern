import { globals } from '@/global/client';
import { features } from '@/stories/client/feature';
import { feature } from '@/stories/client/realms/feature';
import { renderers } from '@/stories/client/renderer';
import { images } from '@/stories/images/client';

import { stories as main } from '..';

import { menu, property, tabs } from './content';
import { proxy } from './proxy';

export * from './state';
export * from './component';
export type * from './content';
export type * from './feature';
export type * from './renderer';
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
  stories.features.registry.register(stories.feature, images.feature);
}
