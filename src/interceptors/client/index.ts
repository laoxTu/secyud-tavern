'use client';
import { toast } from 'sonner';

import { translator } from '@/components';

import { BusinessError } from '..';

export class ApiError extends BusinessError {
  constructor(message: string, code?: string, data?: any) {
    super(message, code);
    if (data) {
      this.data = { ...data };
    }
  }
}

type AsyncFunc<A extends any[] = [], T = void> = (...args: A) => Promise<T>;

export function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError) {
    const message = error.message.toLowerCase();
    return (
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('load failed')
    );
  }
  return false;
}

export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}

export function isHttpError(error: unknown): boolean {
  // 假设 error 有 status 或 response.status
  const status = (error as any)?.response?.status || (error as any)?.status;
  return typeof status === 'number' && status >= 400;
}

export function success(message: string) {
  toast.success(message, {
    richColors: true,
  });
}
export function error(err: any) {
  console.error(err);
  if (err instanceof BusinessError && err.code) {
    toast.error(translator.translate(err.code, err.data), {
      richColors: true,
    });
  } else if (typeof err === 'string') {
    // 字符串的错误消息，不知道从哪里来的
    toast.error(err, {
      richColors: true,
    });
  } else if (isNetworkError(err) || isHttpError(err) || isAbortError(err)) {
    // 默认错误消息
    toast.error(err?.message, {
      richColors: true,
    });
  } else {
    /**
     * 继续抛出意味着页面崩溃，进入notfound
     */
    throw err;
  }
}

export function handler<A extends any[], T>(
  action: AsyncFunc<A, T>,
  finish?: AsyncFunc<A>,
): AsyncFunc<A, T> {
  return async (...args: A) => {
    try {
      return await action(...args);
    } catch (err) {
      error(err);
    } finally {
      await finish?.(...args);
    }
    return undefined!;
  };
}
