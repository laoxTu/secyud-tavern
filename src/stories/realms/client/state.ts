import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { BusinessError } from '@/interceptors';
import { proxy } from '@/stories/client/proxy';

import { realms } from '.';

export interface RealmInfo {
  title: string;
  content?: string | null;
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
  // 生成信息
  realmInfos: Record<string, RealmInfo | undefined>;
  setRealmInfo: (name: string, realmInfo?: RealmInfo) => void;
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
  initPager: () => Promise<void>;
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
          origin.abort(new BusinessError(reason, `message.${reason}`));
        }
        set({ signal });
      },
      realmInfos: {},
      setRealmInfo(name, realmInfo) {
        const { generating, realmInfos } = get();
        if (generating) {
          set({ realmInfos: { ...realmInfos, [name]: realmInfo } });
        }
      },
      generating: false,
      pinned: true,
      setPinned: (pinned) => set({ pinned }),
      prepare: false,
      setPrepare: (prepare: boolean) => set({ prepare }),
      index: { max: 1, cur: 0 },
      async setIndex(cur?: number) {
        const { histories } = realms;
        const max = histories?.length ?? 0;
        const { index, setOutput } = get();
        cur ??= index.cur;
        if (cur > max) cur = max;
        else if (cur < 0) cur = 0;

        console.debug(`[realm](page): ${cur}/${max}`);
        set({ index: { max, cur } });
        await setOutput();
      },
      output: { max: 0, cur: -1 },
      async initPager() {
        const { histories, realm } = realms;
        await get().setIndex(histories?.length ?? 0);
        const current = await realms.history(null, realm);
        set({
          output: {
            cur: current.index,
            max: current.spaces.length,
          },
        });
      },
      async setOutput(cur?: number) {
        const { histories, realm } = realms;
        const { index, generating } = get();
        if (!histories || histories.length < index.cur || generating) return;
        let max = 0;
        if (index.cur > 0) {
          const history = await realms.history(index.cur, realm);
          max = history.spaces.length;
          cur ??= history.index;
          if (cur >= max) cur = max - 1;
          if (history.index != cur) {
            history.index = cur;
            await proxy.history.set(history.masterId, history.sequence, {
              index: cur,
            });
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
