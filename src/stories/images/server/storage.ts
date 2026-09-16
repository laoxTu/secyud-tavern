import { storages } from '@/stories/server/factory';

import { images, StoryImage } from '..';

export const imageStorage = storages.create<StoryImage>(
  images,
  ({ data, name }) => ({
    filter: `${data.image}`,
    sorter: `${name}${data.updateAt}`,
  }),
);
