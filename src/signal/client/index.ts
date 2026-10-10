'use client';
import { useEffect } from 'react';
import { toast } from 'sonner';

import { translator } from '@/components';
import { jsonUtils } from '@/utils';

import { signals as main, ToastMessage } from '..';

import { useSseConnection } from './hook';
import { proxy } from './proxy';

export * from './hook';

function createCallback<TM>(
  type: string,
  callback: (target: string, data: TM) => void,
) {
  const es = useSseConnection.getState().eventSource;
  const action = (event: MessageEvent) => {
    if (event.type === type) {
      const data = jsonUtils.parse(event.data);
      if (data) {
        callback(data.target ?? '', { ...data, target: undefined });
      }
    }
  };
  es.addEventListener(type, action);
  return () => {
    es.removeEventListener(type, action);
  };
}
/**
 * 监听sse事件
 * @param type 事件类型
 * @param callback 回调函数
 */
export function useSse<TM>(
  type: string,
  callback: (target: string, data: TM) => void,
) {
  useEffect(() => {
    return createCallback<TM>(type, callback);
  }, []);
}

export const signals = {
  ...main,
  proxy,
};

export default async function () {
  createCallback<ToastMessage>('toast', (_, data) => {
    const send = toast[data.type] ?? toast.error;
    send(translator.translate(data.message, data.data), { richColors: true });
  });
}
