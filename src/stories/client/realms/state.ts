import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { signalUtils } from '@/signal';

import { realms } from '.';

export interface RealmInfo {
  title: string;
  content: string;
}

interface Page {
  cur: number;
  max: number;
}

export interface RealmState {
  // 用户输入
  content: string;
  setContent: (content: string) => void;
  // 是否总结
  summary: boolean;
  setSummary: (summary: boolean) => void;
  // 信号
  signal?: AbortController;
  setSignal: (signal?: AbortController, reason?: string) => void;
  setAbort: (func: () => void) => void;
  // 生成信息
  realmInfo: RealmInfo;
  setRealmInfo: (realmInfo: RealmInfo) => void;
  /**
   * 是否生成中，不可用realmInfo是否为空判定，
   * 因为子agent也会用，这个标志同时影响是否
   * 更新状态导致渲染刷新
   */
  generating: boolean;
  pinned: boolean;
  setPinned: (pinned: boolean) => void;
  // 历史索引
  index: Page;
  // 默认不更改页面，只重渲染
  setIndex: (cur?: number) => Promise<void>;
  // 历史索引
  prepare: boolean;
  setPrepare: (prepare: boolean) => void;
  // 默认不更改页面，只重渲染
  output: Page;
  setOutput: (cur?: number) => Promise<void>;
}

export const useRealmState = create<RealmState>()(
  persist(
    (set, get) => ({
      content: '',
      setContent(content: string | ((t: string) => string)) {
        return typeof content === 'string'
          ? set({ content })
          : set((u) => ({ content: content(u.content) }));
      },
      summary: false,
      setSummary: (summary: boolean) => set({ summary: summary }),
      setSignal(signal, reason) {
        const origin = get().signal;
        if (origin && reason) {
          origin.abort(reason);
        }
        set({ signal });
      },
      setAbort(action) {
        const signal = get().signal?.signal;
        if (!signal) {
          console.debug(`[signal]: not set`);
          return;
        }
        console.debug(`[signal]: set abort`);
        signalUtils.setAbort(signal, action);
      },
      realmInfo: { title: 'realm.generating', content: '' },
      setRealmInfo: (realmInfo) => get().generating && set({ realmInfo }),
      generating: false,
      pinned: true,
      setPinned: (pinned) => set({ pinned }),
      prepare: false,
      setPrepare: (prepare: boolean) => set({ prepare }),
      index: { max: 1, cur: 0 },
      async setIndex(cur?: number) {
        const { histories } = realms.realm;
        const max = histories.length;
        const { index, setOutput } = get();
        cur ??= index.cur;
        if (cur > max) cur = max;
        else if (cur < 0) cur = 0;

        console.debug(`[realm](page): ${cur}/${max}`);
        set({ index: { max, cur } });
        await setOutput();
      },
      output: { max: 0, cur: -1 },
      async setOutput(cur?: number) {
        const {
          realm: { histories },
          history: { get: getHistory, set: setHistory },
        } = realms;
        const { index } = get();
        if (histories.length < index.cur) return;
        let max = 0;
        if (index.cur > 0) {
          const history = await getHistory(index.cur);
          max = history.outputs.length;
          cur ??= history.output;
          if (cur >= max) cur = max - 1;
          if (history.output != cur) {
            history.output = cur;
            await setHistory(index.cur);
          }
        } else {
          cur = -1;
        }
        console.debug(`[realm](output page): ${cur}/${max}`);
        set({ output: { max, cur }, prepare: true });
      },
    }),
    {
      name: 'realm',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        pinned: state.pinned,
      }),
    },
  ),
);
