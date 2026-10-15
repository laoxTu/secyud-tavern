import { macros } from '@/presets/macros/server';
import { regexes } from '@/presets/regexes/server';
import { scripts } from '@/presets/scripts/server';
import { repository } from '@/presets/server/repository';
import { styles } from '@/presets/styles/server';
import { tools } from '@/tools/server';

import { presets as main } from '..';
import { lorebooks } from '../lorebooks/server';

import { storage } from './storage';

export const presets = {
  ...main,
  repository,
  storage,
};

export default async function () {
  presets.storage.registry.register(
    styles.storage.preset,
    scripts.storage.preset,
    regexes.storage.preset,
    macros.storage.preset,
    lorebooks.storage.preset,
  );

  tools.providers.registry.register(lorebooks.tool);
}
