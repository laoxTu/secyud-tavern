'use client';

import { globals } from '@/global/client';

import { files } from '../files/client';

export type * from './factory';
export * from './storage';

export default async function () {
  globals.menus.register(files.menu);
}
