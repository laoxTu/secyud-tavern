import { Storage } from '@/database/server';
import { storages } from '@/database/server/factory';
import { getRegistry } from '@/plugins';
import { Story } from '@/stories';

export interface StoryStorage extends Storage<Story> {}

const registry = getRegistry<StoryStorage>('story-storage');

const manager = storages.createManager(registry);

export const storage = {
  registry,
  manager,
};
