'use client';
import { globals } from '@/global/client';
import { models } from '@/models/client';
import { macros } from '@/presets/macros/client';
import { regexes } from '@/presets/regexes/client';
import { scripts } from '@/presets/scripts/client';
import { styles } from '@/presets/styles/client';
import { stories } from '@/stories/client';

import { presets as main } from '..';

import { menu, property, tabs } from './content';
import { proxy } from './proxy';

export * from './component';
export type * from './content';
export * from './state';

export const presets = {
  ...main,
  proxy,
  menu,
  property,
  tabs,
};
export default async function () {
  globals.menus.register(presets.menu);
  presets.tabs.register(
    presets.property,
    styles.tab.preset,
    scripts.tab.preset,
    regexes.tab.preset,
    macros.tab.preset,
  );
  stories.renderers.registry.register(
    styles.renderer,
    scripts.renderer,
    regexes.renderer,
    macros.renderer,
  );
  models.processers.registry.register(regexes.processer, macros.processer);
  stories.features.registry.register(macros.feature);
}
