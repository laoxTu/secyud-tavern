import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface GlobalState {
  menu?: string;
  setMenu: (menu?: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const useGlobalState = create<GlobalState>()(
  persist(
    (set) => ({
      menu: undefined,
      setMenu: (menu) => set({ menu }),
      open: true,
      setOpen: (open) => set({ open }),
    }),
    {
      name: 'global_state',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        menu: state.menu,
        open: state.open,
      }),
    },
  ),
);
