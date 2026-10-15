import { memories as main } from '..';

import { storage } from './storage';
import { tool } from './tool';

export const memories = {
  ...main,
  storage: {
    story: storage,
  },
  tool,
};
