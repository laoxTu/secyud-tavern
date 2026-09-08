import { imageStorage } from '@/stories/images/server/storage';

import { images as main } from '..';

export const images = {
  ...main,
  storage: imageStorage,
};
