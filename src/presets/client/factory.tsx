'use client';
import { create } from 'zustand';

import { EntryRequestParam } from '@/database';
import { FetchState, states } from '@/database/client/factory';

import { PresetEntry } from '..';

import { proxy } from './proxy';
import { usePresetState } from './state';

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
    get fetch() {
      return states.createFetch<PresetEntry<TData>, EntryRequestParam>(
        set,
        get,
        async (request) => {
          const { item } = usePresetState.getState();

          return await proxy.entry.list(item!.id, {
            ...request,
            search: {
              ...(request?.search ?? {}),
              entryType: name,
            },
          });
        },
      );
    },
    refresh: (options) => get().fetch(options),
  }));
}
