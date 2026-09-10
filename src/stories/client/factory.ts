'use client';
import { create } from 'zustand';

import { EntryRequestParam } from '@/database';
import { FetchState, states } from '@/database/client/factory';

import { StoryEntry } from '..';

import { proxy } from './proxy';
import { useStoryState } from './state';

export interface StoryEntryState<TData> extends FetchState<
  StoryEntry<TData>,
  EntryRequestParam
> {
  name: string;
  defaultData: TData;
}

export function createStoryEntryState<TData>(
  name: string,
  defaultData: TData,
  size: number = 5,
) {
  return create<StoryEntryState<TData>>((set, get) => ({
    name,
    defaultData,
    cur: 0,
    loading: false,
    size,
    max: 0,
    fetch: states.createFetch<StoryEntry<TData>, EntryRequestParam>(
      set,
      get,
      async (request) => {
        const { item } = useStoryState.getState();

        return await proxy.entry.list(item!.id, {
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
