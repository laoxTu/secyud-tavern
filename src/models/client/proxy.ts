import { del, get, post, put } from '@/client';
import { DataRequest, DataResponse, Entity, InDto } from '@/database';

import { Model, ModelRequestParam } from '..';

export const proxy = {
  get: async (id: string): Promise<Model> => {
    return await get('models/{id}', {
      params: { id },
    });
  },
  list: async (
    request?: DataRequest<ModelRequestParam>,
  ): Promise<DataResponse<Model>> => {
    return await get('models', {
      params: request,
    });
  },
  create: async (model: Model | InDto<Model>): Promise<Entity> => {
    return await post('models', model);
  },
  clone: async (id: string, model: Partial<Model>): Promise<Entity> => {
    return await post('models/{id}/clone', model, {
      params: { id },
    });
  },
  update: async (id: string, model: Partial<Model>): Promise<void> => {
    await put('models/{id}', model, {
      params: { id },
    });
  },
  delete: async (id: string): Promise<void> => {
    return await del('models/{id}', {
      params: { id },
    });
  },
  engine: {
    /**
     * 通过ai接口生成回复
     */
    generate: async (
      id: string,
      input: any,
      signal: AbortSignal,
    ): Promise<Response> => {
      return await post('models/{id}/engine/generate', input, {
        params: { id },
        signal,
      });
    },
  },
};
