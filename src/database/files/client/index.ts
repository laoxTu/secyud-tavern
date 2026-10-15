'use client';
import { menu } from '@/database/files/client/content';
import { proxy } from '@/database/files/client/proxy';
import { globals } from '@/global/client';

import { files as main } from '..';

export const files = {
  ...main,
  proxy,
  menu,
};

export default async function () {
  globals.menus.register(files.menu);
}
