'use client';
import { menus } from '@/global/client/menu';
import { proxy, settingProxy } from '@/global/client/proxy';
import { menu, tabs } from '@/global/client/setting';

export * from './loading';
export * from './menu';
export type * from './setting';
export * from './state';

export const globals = {
  menus,
  proxy,
  menu: {
    setting: menu,
  },
};

export const settings = {
  tabs,
  proxy: settingProxy,
};
export default async function () {
  menus.register(globals.menu.setting);
}
