import { storages } from '@/presets/server/factory';

import { Regex, regexes } from '..';

export const storage = storages.create<Regex>(
  regexes,
  ({ name, data: { target } }) => ({
    sorter: `${name}`,
    filter: `${target}${name}`,
  }),
);
