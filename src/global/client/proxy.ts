import { get, post, put } from '@/client';

export const settingProxy = {
  get: async <T>(id: string): Promise<T> => {
    return await get('settings/{id}', {
      params: { id },
    });
  },
  set: async <T>(id: string, value: T) => {
    await put('settings/{id}', value, {
      params: { id },
    });
  },
};

export const proxy = {
  fetch: async <T = any>(
    method: string,
    url: string,
    body?: any,
  ): Promise<T> => {
    return await post('proxy', { method, url, body });
  },
};
