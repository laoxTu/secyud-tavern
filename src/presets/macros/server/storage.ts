import { storages } from '@/presets/server/factory';

import { Macro, macros } from '..';

export const storage = storages.create<Macro>(
  macros,
  ({ name, data: { key, multiple, hidden } }) => ({
    sorter: `${key}${+multiple}${+hidden}`,
    filter: `${key}${name}`,
  }),
);
