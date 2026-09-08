import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import {
  ComfyUIModel,
  ComfyUIModelRequestParam,
  ComfyUIModelSetting,
  comfyuis,
  ComfyUIWorkflow,
  ComfyUIWorkflowRequestParam,
} from '@/comfyui';
import { dbStorage, FetchState } from '@/database/client';
import { states } from '@/database/client/factory';

import { proxy } from './proxy';

export interface ComfyUIModelSettingState extends ComfyUIModelSetting {}

export const useComfyUIModelSettingState = create<ComfyUIModelSettingState>()(
  persist<ComfyUIModelSettingState>(
    () => ({
      directory: '/home/user/comfyui/models',
      client: 'secyud-tavern',
      url: 'http://localhost:8188',
    }),
    {
      name: comfyuis.model.setting,
      storage: createJSONStorage(() => dbStorage),
      partialize: (state) => ({
        directory: state.directory,
        client: state.client,
        url: state.url,
      }),
    },
  ),
);

export interface ComfyUIState {
  // 控制当前是模型还是工作流界面
  page: string;
  setPage: (page: string) => void;
}

export const useComfyUIState = create<ComfyUIState>((set) => ({
  page: comfyuis.model.name,
  setPage(page: string) {
    set({ page });
  },
}));

export interface ComfyUIModelState extends FetchState<
  ComfyUIModel,
  ComfyUIModelRequestParam
> {}

export const useComfyUIModelState = create<ComfyUIModelState>((set, get) => ({
  cur: 0,
  loading: false,
  size: 12,
  max: 0,
  fetch: states.createFetch<ComfyUIModel, ComfyUIModelRequestParam>(
    set,
    get,
    async (request) => {
      return await proxy.model.list(request);
    },
  ),
  refresh: (options) => get().fetch(options),
}));

export interface ComfyUIWorkflowState extends FetchState<
  ComfyUIWorkflow,
  ComfyUIWorkflowRequestParam
> {
  item?: ComfyUIWorkflow;
  setItem: (id?: string) => Promise<void>;
}

export const useComfyUIWorkflowState = create<ComfyUIWorkflowState>(
  (set, get) => ({
    cur: 0,
    items: [],
    loading: false,
    size: 7,
    max: 0,
    setItem: async (id?: string) => {
      const item = id ? await proxy.workflow.get(id) : undefined;
      set({ item });
    },
    fetch: states.createFetch<ComfyUIWorkflow, ComfyUIWorkflowRequestParam>(
      set,
      get,
      async (request) => {
        return await proxy.workflow.list(request);
      },
    ),
    refresh: (options) => get().fetch(options),
  }),
);
