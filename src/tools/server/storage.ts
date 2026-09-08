import { storages } from '@/presets/server/factory';
import { Tool, tools } from '@/tools';

export const storage = storages.create<Tool>(
  tools,
  ({ name, data: { type } }) => ({
    sorter: `${type}${name}`,
    filter: `${type}${name}`,
  }),
);
