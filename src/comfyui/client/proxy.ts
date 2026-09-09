'use client';
import { del, get, post, put } from '@/client';
import {
  ComfyUIModel,
  ComfyUIModelRequestParam,
  ComfyUIParam,
  ComfyUIParamRequestParam,
  comfyuis,
  ComfyUIWorkflow,
  ComfyUIWorkflowRequestParam,
} from '@/comfyui';
import { useComfyUIModelSettingState } from '@/comfyui/client/state';
import { DataRequest, DataResponse, Entity, InDto } from '@/database';
import { globals } from '@/global/client';

const cache: Record<string, any> = {};

export const proxy = {
  async generate(prompt: any) {
    const setting = useComfyUIModelSettingState.getState();
    const body = JSON.stringify({
      client_id: setting.client,
      prompt,
    });
    return await globals.proxy.fetch('POST', `${setting.url}/prompt`, body);
  },
  model: {
    async import(models: ComfyUIModel[]): Promise<Entity[]> {
      return await post('comfyuis/models/import', models);
    },
    async download(id: string) {
      await post(
        'comfyuis/models/{id}/download',
        {},
        {
          params: { id },
        },
      );
    },
    /**
     * 简单缓存，用于复用
     * @param id
     */
    async cache(id: string): Promise<ComfyUIModel> {
      let model = cache[id];
      if (!model) {
        model =
          (await get('comfyuis/models/{id}', {
            params: { id },
          })) ?? comfyuis.model.default;
        cache[id] = model;
      }

      return model;
    },
    async get(id: string): Promise<ComfyUIModel> {
      return await get('comfyuis/models/{id}', {
        params: { id },
      });
    },
    async list(
      request?: DataRequest<ComfyUIModelRequestParam>,
    ): Promise<DataResponse<ComfyUIModel>> {
      return await get('comfyuis/models', {
        params: request,
      });
    },
    async create(model: ComfyUIModel | InDto<ComfyUIModel>): Promise<Entity> {
      return await post('comfyuis/models', model);
    },
    async update(id: string, model: Partial<ComfyUIModel>): Promise<Entity> {
      return await put('comfyuis/models/{id}', model, {
        params: { id },
      });
    },
    async delete(id: string): Promise<void> {
      return await del('comfyuis/models/{id}', {
        params: { id },
      });
    },
  },
  workflow: {
    async get(id: string): Promise<ComfyUIWorkflow> {
      return await get('comfyuis/workflows/{id}', {
        params: { id },
      });
    },
    async list(
      request?: DataRequest<ComfyUIWorkflowRequestParam>,
    ): Promise<DataResponse<ComfyUIWorkflow>> {
      return await get('comfyuis/workflows', {
        params: request,
      });
    },
    async create(
      workflow: ComfyUIWorkflow | InDto<ComfyUIWorkflow>,
    ): Promise<Entity> {
      return await post('comfyuis/workflows', workflow);
    },
    async update(
      id: string,
      workflow: Partial<ComfyUIWorkflow>,
    ): Promise<Entity> {
      return await put('comfyuis/workflows/{id}', workflow, {
        params: { id },
      });
    },
    async delete(id: string): Promise<void> {
      return await del('comfyuis/workflows/{id}', {
        params: { id },
      });
    },
    async clone(id: string, item: Partial<ComfyUIWorkflow>): Promise<Entity> {
      return await post('comfyuis/workflows/{id}/clone', item, {
        params: { id },
      });
    },
    param: {
      async generate(id: string): Promise<void> {
        await post(
          'comfyuis/workflows/{id}/params/generate',
          {},
          {
            params: { id },
          },
        );
      },
      async get(id: string, index: number): Promise<ComfyUIParam> {
        return await get('comfyuis/workflows/{id}/params/{sequence}', {
          params: { id, sequence: index },
        });
      },
      async add(
        id: string,
        hiworkflow: ComfyUIParam,
      ): Promise<{ sequence: number }> {
        return await post('comfyuis/workflows/{id}/params', hiworkflow, {
          params: { id },
        });
      },
      async list(
        id: string,
        request?: DataRequest<ComfyUIParamRequestParam>,
      ): Promise<DataResponse<ComfyUIParam>> {
        return await get('comfyuis/workflows/{id}/params', {
          params: { id, ...request },
        });
      },
      async set(
        id: string,
        sequence: number,
        hiworkflow: ComfyUIParam,
      ): Promise<void> {
        await put('comfyuis/workflows/{id}/params/{sequence}', hiworkflow, {
          params: { id, sequence },
        });
      },
      async del(id: string, sequence: number): Promise<void> {
        await del('comfyuis/workflows/{id}/params/{sequence}', {
          params: { id, sequence },
        });
      },
      async clone(
        id: string,
        sequence: number,
        param?: Partial<ComfyUIParam>,
      ): Promise<{ sequence: number }> {
        return await post(
          'comfyuis/workflows/{id}/params/{sequence}/clone',
          param,
          {
            params: { id, sequence },
          },
        );
      },
    },
  },
};
