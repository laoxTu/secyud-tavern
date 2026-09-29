import { tasks as main } from '..';

import { proxy } from './proxy';

export const tasks = {
  ...main,
  proxy,
};

export default async function () {}
