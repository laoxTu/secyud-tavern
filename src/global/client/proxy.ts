import { get, getBaseUrl, post, put } from '@/client';

import { ProxyParam } from '..';

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
  fetch: async <T = any>(param: ProxyParam): Promise<T> => {
    return await post('proxy', param);
  },
  /**
   * 原始响应版本。
   * post() 会把 application/json 直接解析掉，拿不到响应头也读不了流，
   * 需要这两样的调用（如 mcp 的会话id与 sse 流）走这里。
   */
  raw: async (
    param: ProxyParam,
    options?: { signal?: AbortSignal },
  ): Promise<Response> => {
    return await fetch(`${getBaseUrl()}/api/proxy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(param),
      signal: options?.signal,
    });
  },
};
