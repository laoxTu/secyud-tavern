import { ReplaceIcon } from 'lucide-react';

import { utils } from '@/database';
import { models } from '@/models/client';
import { Realm } from '@/stories';

import { macros as main } from '..';

import { Content } from './content';
import { feature } from './feature';
import { MacroCache, processer, renderer } from './realm';

export interface MacroProperty {
  checkItems: Record<string, boolean>;
  selections: Record<string, string | undefined>;
}

export const macros = {
  ...main,
  property(realm: Realm) {
    return utils.getProperty<MacroProperty>(realm, main.name, () => ({
      checkItems: {},
      selections: {},
    }));
  },
  cache(realm: Realm) {
    return models.cache<MacroCache>(realm, main.name);
  },
  renderer,
  processer,
  tab: {
    preset: {
      id: main.name,
      hidable: true,
      icon: () => <ReplaceIcon />,
      label: `macro.id`,
      content: Content,
    },
  },
  feature,
};
