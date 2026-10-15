import { lorebooks as main } from '..';

import { tool } from './provider';
import { storage } from './storage';

export const lorebooks = {
  ...main,
  storage: {
    preset: storage,
  },
  tool,
};
