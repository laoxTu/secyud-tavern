'use client';
import { create } from 'zustand';

import { FetchState, states } from '@/database/client/factory';
import { signals } from '@/signal/client';

import { Task, TaskRequestParam } from '..';

import { tasks } from '.';

export interface TaskState extends FetchState<Task, TaskRequestParam> {}

export const useTaskState = create<TaskState>((set, get) => ({
  cur: 0,
  loading: false,
  tab: 'property',
  size: 7,
  max: 0,
  fetch: states.createFetch<Task, TaskRequestParam>(
    set,
    get,
    async (request) => {
      const result = await tasks.proxy.list(request);
      await signals.proxy.subscription({
        type: 'task_progress',
        targets: result.items.map((u) => u.id),
        action: 'set',
        status: 'part',
      });
      return result;
    },
  ),
  refresh: (options) => get().fetch(options),
}));
