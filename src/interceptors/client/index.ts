'use client';
import { _Translator, useTranslations } from 'next-intl';
import { useCallback } from 'react';
import { toast } from 'sonner';

import { BusinessError } from '..';

export class ApiError extends BusinessError {
  constructor(message: string, code?: string, data?: any) {
    super(message, code);
    if (data) {
      this.data = { ...data };
    }
  }
}

type AsyncFunc<T = void> = (...args: any[]) => Promise<T>;

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

function handleError(t: _Translator, err: any) {
  if (err instanceof BusinessError) {
    console.error(err);
    if (err.code) {
      const record: Record<string, any> = {};
      if (err.data) {
        for (const key in err.data) {
          const value = err.data[key];
          if (typeof value === 'string') {
            record[key] = t.has(value) ? t(value) : value;
          } else record[key] = value;
        }
      }
      toast.error(t(err.code, record), {
        richColors: true,
      });
      return;
    }
    // 默认错误消息
    toast.error(err.message, {
      richColors: true,
    });
  } else if (isNetworkError(err) || isHttpError(err)) {
    // 网络错误 → 静默处理
    toast.error(err.message, {
      richColors: true,
    });
    console.error(err);
  } else {
    /**
     * 继续抛出意味着页面崩溃，进入notfound
     */
    toast.error(err?.message, {
      richColors: true,
    });
    throw err;
  }
}

export function useHandler() {
  const t = useTranslations();

  const error = useCallback(
    (err: any) => {
      handleError(t, err);
    },
    [t],
  );
  const success = useCallback((message: string) => {
    toast.success(message, {
      richColors: true,
    });
  }, []);

  function handler<T>(
    action: AsyncFunc<T>,
    finish?: AsyncFunc<T>,
  ): AsyncFunc<T> {
    return async (...args: any[]) => {
      try {
        return await action(...args);
      } catch (err) {
        error(err);
      } finally {
        await finish?.();
      }
      return undefined!;
    };
  }

  return { error, success, handler };
}
