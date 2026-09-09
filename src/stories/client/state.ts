'use client';
import { create } from 'zustand';

import { FetchState, states } from '@/database/client/factory';
import { Story, StoryRequestParam } from '@/stories';
import { stories } from '@/stories/client';

export interface StoryState extends FetchState<Story, StoryRequestParam> {
  item?: Story;
  setItem: (id?: string) => Promise<void>;
  tab: string;
  setTab: (tab?: string) => void;
}

export const useStoryState = create<StoryState>((set, get) => ({
  cur: 0,
  loading: false,
  tab: 'property',
  size: 7,
  max: 0,
  setItem: async (id?: string) => {
    const item = id
      ? await stories.proxy.get(id, {
          types: true,
        })
      : undefined;
    set({ item });
  },
  setTab: (tab) => set({ tab }),
  fetch: states.createFetch<Story, StoryRequestParam>(
    set,
    get,
    async (request) => {
      return await stories.proxy.list(request);
    },
  ),
  refresh: (options) => get().fetch(options),
}));
