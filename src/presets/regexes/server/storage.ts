import { storages } from '@/presets/server/factory';

import { Regex, regexes } from '..';

export const storage = storages.create<Regex>(
  regexes,
  ({ name, data: { target } }) => ({
    sorter: `${name}`,
    filter: `${target}${name}`,
  }),
  async ({}, entry, s) => {
    const name = `${entry.name}-${s}`;
    return name;
  },
  async () => {},
);
