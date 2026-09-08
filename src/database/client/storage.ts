import { StateStorage } from 'zustand/middleware';

import { settings } from '@/global/client';
import { jsonUtils } from '@/utils';

export const dbStorage: StateStorage = {
  getItem: async (name: string) => {
    const setting = await settings.proxy.get<any>(name);
    return JSON.stringify(setting || '{}');
  },

  setItem: async (name: string, value: string) => {
    await settings.proxy.set<any>(name, jsonUtils.parse(value));
  },

  removeItem: async (name: string) => {
    await settings.proxy.set<any>(name, null);
  },
};
