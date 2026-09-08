import { NextRequest, NextResponse } from 'next/server';

import { getRegistry, Registerable } from '@/plugins';
import { registerServerPlugins } from '@/server-registerer';

export interface NextContext {
  params: Promise<Record<string, any>>;
}

export interface NextRecord extends NextContext {
  searchParams: Record<string, any>;
}

export interface InterceptorHandler extends Registerable {
  handle: (
    request: NextRequest,
    records: NextRecord,
    next: () => Promise<NextResponse>,
  ) => Promise<NextResponse>;
}

// 用户的输入方法
export type NextHandler = (
  request: NextRequest,
  records: NextRecord,
) => Promise<NextResponse>;
// 拦截器生成的路由
type NextHandlerResult = (
  request: NextRequest,
  context: NextContext,
) => Promise<NextResponse>;

/**
 * 从 URLSearchParams 反序列化为对象
 * 默认的searchParams 无法支持复杂对象
 * 和 client.ts 中 buildUrl 方法对应
 */
function deserializeSearchParams(searchParams: URLSearchParams) {
  const raw = Object.fromEntries(searchParams);
  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(raw)) {
    if (!value || typeof value !== 'string') continue;
    const trim = value.trim();
    if (!trim) continue;
    try {
      result[key] = JSON.parse(trim);
    } catch {
      result[key] = trim;
    }
  }

  return result;
}

/**
 * 递归执行中间件
 * */
function composeInterceptors(
  interceptors: InterceptorHandler[],
  route: NextHandler,
): NextHandlerResult {
  return async (request, context) => {
    const records: NextRecord = {
      ...context,
      searchParams: deserializeSearchParams(request.nextUrl.searchParams),
    };

    const dispatch = async (index: number): Promise<NextResponse> => {
      if (index >= interceptors.length) {
        return await route(request, records);
      }
      const interceptor = interceptors[index];
      console.debug(`[interceptor] intercepted by ${interceptor.id}`);
      const next = () => dispatch(index + 1);
      return interceptor.handle(request, records, next);
    };
    return dispatch(0);
  };
}

export const manager = getRegistry<InterceptorHandler>('interceptor');

export function route(route: NextHandler): NextHandlerResult {
  return async (request: NextRequest, context: NextContext) => {
    await registerServerPlugins();
    console.debug(`[interceptor](${request.method}): ${request.url}`);
    const interceptors = manager.sorted();
    const handler = composeInterceptors(interceptors, route);
    return handler(request, context);
  };
}
