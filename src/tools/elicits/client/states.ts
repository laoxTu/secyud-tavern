import { create } from 'zustand';

import { Entity } from '@/database';
import { Mutex } from '@/utils/mutex';

export interface ElicitItem extends Entity {
  question: string;
  examples: string[];
  // 是否允许自定义项
  custom?: boolean;
  reply: (answer: string) => Promise<void>;
}
const mutex: Mutex = new Mutex();
// 当前轮次的 items
const items: ElicitItem[] = [];
export interface ElicitsState {
  // elicit 的渲染计数
  render: number;
  item: ElicitItem | null;
  timeout: (item: ElicitItem) => Promise<void>;
  pop: (item?: ElicitItem) => Promise<void>;
  push: (item: ElicitItem) => Promise<void>;
}

export const useElicitState = create<ElicitsState>((set, get) => ({
  render: 0,
  item: null,
  timeout: async (input) => {
    await mutex.lock(async () => {
      const { render, item } = get();
      if (item?.id === input.id) {
        const next = items.shift() || null;
        set({
          item: next,
          render: render + 1,
        });
      } else {
        const index = items.findIndex((i) => i.id === input.id);
        if (index !== -1) {
          items.splice(index, 1);
        }
      }
    });
  },
  pop: async (input) => {
    await mutex.lock(async () => {
      const { render, item } = get();
      if (input && item && input.id !== item.id) {
        return;
      }
      const next = items.shift() || null;
      set({
        item: next,
        render: render + 1,
      });
    });
  },
  push: async (item) => {
    await mutex.lock(async () => {
      const { render, item: currentItem } = get();
      if (currentItem) {
        items.push(item);
      } else {
        set({
          item,
          render: render + 1,
        });
      }
    });
  },
}));
