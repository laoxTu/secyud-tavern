import { menu } from '@/files/client/content';
import { proxy } from '@/files/client/proxy';
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
