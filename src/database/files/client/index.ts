'use client';
import { menu } from '@/database/files/client/content';
import { proxy } from '@/database/files/client/proxy';

import { files as main } from '..';

export const files = {
  ...main,
  proxy,
  menu,
};
