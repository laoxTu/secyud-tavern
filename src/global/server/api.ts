import { NextResponse } from 'next/server';

import { BusinessError } from '@/interceptors';
import { route } from '@/interceptors/server';
import { response } from '@/utils/server/response';

import { ProxyParam } from '..';

import { settings } from '.';

export default {
  proxy: {
    /**
     * 代理fetch，通过后端转发防止跨域问题
     * 可用于抓取网页等操作
     * 也可对接第三方接口
     */
    POST: route(async (request) => {
      const {
        url,
        method = 'GET',
        body,
        headers = {},
        ignore,
      }: ProxyParam = await request.json();
      if (!url) throw new BusinessError('missing url');

      // 转发请求
      const result = await fetch(url, {
        method,
        body,
        headers: {
          ...headers,
          // 可以过滤或添加特定 headers
        },
        signal: request.signal,
      });

      // 获取原始响应的所有信息
      const responseHeaders = new Headers(result.headers);

      const response = ignore
        ? result.body?.cancel().catch(() => {}) && null
        : result.body;

      // 关键：直接返回原始响应
      return new NextResponse(response, {
        status: result.status,
        statusText: result.statusText,
        headers: responseHeaders,
      });
    }),
  },
  settings: {
    '[id]': {
      GET: route(async (_, records) => {
        const { id } = await records.params;
        const setting = await settings.repository.get(id);
        return response.json(setting?.data);
      }),
      PUT: route(async (request, records) => {
        const { id } = await records.params;
        const data = await request.json();
        await settings.repository.set({ id, data });
        return response.null();
      }),
    },
  },
};
