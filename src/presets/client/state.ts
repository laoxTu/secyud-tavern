'use client';
import { create } from 'zustand';

import { FetchState, states } from '@/database/client/factory';
import { Preset, PresetRequestParam } from '@/presets';
import { presets } from '@/presets/client';

export interface PresetState extends FetchState<Preset, PresetRequestParam> {
  item?: Preset;
  setItem: (id?: string) => Promise<void>;
  tab: string;
  setTab: (tab?: string) => void;
}

export const usePresetState = create<PresetState>((set, get) => ({
  cur: 0,
  loading: false,
  size: 7,
  max: 0,
  setItem: async (id?: string) => {
    const item = id
      ? await presets.proxy.get(id, {
          types: true,
        })
      : undefined;
    set({ item });
  },
  tab: 'property',
  setTab: (tab) => set({ tab }),
  fetch: states.createFetch<Preset, PresetRequestParam>(
    set,
    get,
    async (request) => {
      return await presets.proxy.list(request);
    },
  ),
  refresh: (options) => get().fetch(options),
}));
