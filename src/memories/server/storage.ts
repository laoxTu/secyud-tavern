import { storages } from '@/stories/server/factory';

import { memories, Memory } from '..';

export const storage = storages.create<Memory>(
  memories,
  ({ name, data: { sequence, importance } }) => ({
    sorter: `${String(sequence).padStart(6, '0')}${String(importance).padStart(2, '0')}${name}`,
    filter: `${name}${name}`,
  }),
);
