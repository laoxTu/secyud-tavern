import { stories as main } from '@/stories';
import { images } from '@/stories/images/server';
import { tools } from '@/tools/server';

import { memories } from '../memories/server';

import { repository } from './repository';
import { storage } from './storage';

export const stories = {
  ...main,
  storage,
  repository,
};

export default async function () {
  storage.registry.register(images.storage);
  stories.storage.registry.register(memories.storage.story);
  tools.providers.registry.register(memories.tool);
}
