import { create } from 'zustand';

import { EntryRequestParam } from '@/database';
import { FetchState } from '@/database/client';
import { states } from '@/database/client/factory';

import { PresetEntry } from '..';

import { presets, usePresetState } from '.';

export interface PresetEntryState<TData> extends FetchState<
  PresetEntry<TData>,
  EntryRequestParam
> {
  name: string;
  defaultData: TData;
}

export function createPresetEntryState<TData>(
  name: string,
  defaultData: TData,
) {
  return create<PresetEntryState<TData>>((set, get) => ({
    name,
    defaultData,
    cur: 0,
    loading: false,
    size: 5,
    max: 0,
    fetch: states.createFetch<PresetEntry<TData>, EntryRequestParam>(
      set,
      get,
      async (request) => {
        const { item } = usePresetState.getState();

        return await presets.proxy.entry.list(item!.id, {
          ...request,
          search: {
            ...(request?.search ?? {}),
            entryType: name,
          },
        });
      },
    ),
    refresh: (options) => get().fetch(options),
  }));
}
