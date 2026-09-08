import { Storage } from '@/database/server';
import { storages } from '@/database/server/factory';
import { getRegistry } from '@/plugins';
import { Preset } from '@/presets';

export interface PresetStorage extends Storage<Preset> {}

const registry = getRegistry<PresetStorage>('preset-storage');
const manager = storages.createManager(registry);

export const storage = {
  registry,
  manager,
};
