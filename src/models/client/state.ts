import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { NameValue } from '@/database';
import { dbStorage } from '@/database/client';
import { models } from '@/models/client';

import { models as main, Model, ModelSetting } from '..';

export interface ModelSettingState extends ModelSetting {
  setModel: (model: NameValue | null) => void;
}

export const useModelSettingState = create<ModelSettingState>()(
  persist(
    (set) => ({
      model: null,
      setModel: (model: NameValue | null): void => {
        set({ model });
      },
    }),
    {
      name: main.state.setting,
      storage: createJSONStorage(() => dbStorage),
      partialize: (state) => ({
        model: state.model,
      }),
    },
  ),
);

export interface ModelState {
  item?: Model;
  setItem: (id?: string) => Promise<void>;
}

export const useModelState = create<ModelState>((set) => ({
  setItem: async (id?: string) => {
    const item = id ? await models.proxy.get(id) : undefined;
    set({ item });
  },
}));
