import { storages } from '@/stories/server/factory';

import { images, StoryImage } from '..';

export const imageStorage = storages.create<StoryImage>(images, (u) => ({
  filter: `${u.data.image}`,
  sorter: `${u.data.updateAt}`,
}));
