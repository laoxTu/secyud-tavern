import { storages } from '@/stories/server/factory';

import { memories as main, Memory } from '..';

export const storage = storages.create<Memory>(
  main,
  ({ name, data: { sequence, importance } }) => ({
    sorter: `${String(sequence).padStart(6, '0')}${String(importance).padStart(2, '0')}${name}`,
    filter: `${name}${name}`,
  }),
);
