'use client';
import { create } from 'zustand';

import { FetchState, states } from '@/database/client/factory';

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
      return await tasks.proxy.list(request);
    },
  ),
  refresh: (options) => get().fetch(options),
}));
