import { create } from 'zustand';

export interface ElicitItem {
  question: string;
  examples: string[];
  // 是否允许自定义项
  custom?: boolean;
  reply: (answer: string) => Promise<void>;
}

export interface ElicitsState {
  // elicit 的渲染计数
  render: number;
  // 当前轮次的 items
  items: ElicitItem[];
  item: ElicitItem | null;
  pop: () => void;
  push: (item: ElicitItem) => void;
}

export const useElicitState = create<ElicitsState>((set, get) => ({
  render: 0,
  items: [],
  item: null,
  pop: () => {
    const { items, render } = get();
    const item = items.shift() || null;
    set({
      items,
      item,
      render: render + 1,
    });
  },
  push: (item) => {
    const { items, render, item: currentItem } = get();
    if (currentItem) {
      items.push(item);
      set({
        items,
      });
    } else {
      set({
        item,
        render: render + 1,
      });
    }
  },
}));
