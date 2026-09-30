import { globals } from '@/global/client';

import { tasks as main } from '..';

import { menu } from './content';
import { proxy } from './proxy';

export const tasks = {
  ...main,
  proxy,
  menu,
};

export default async function () {
  globals.menus.register(tasks.menu);
}
