'use client';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { create } from 'zustand';

import { ToastMessage } from '..';

export interface SseConnection {
  eventSource: EventSource;
}

/**
 * 获取sse信号，所有事件在一个客户端通过单例访问
 */
export const useSseConnection = create<SseConnection>(() => {
  let es = null;
  return {
    get eventSource() {
      return (es ??= new EventSource('/api/sse'));
    },
  };
});

function createCallback<TM>(type: string, callback: (data: TM) => void) {
  const es = useSseConnection.getState().eventSource;
  const action = (event: MessageEvent) => {
    if (event.type === type) {
      callback(JSON.parse(event.data));
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
export function useSse<TM>(type: string, callback: (data: TM) => void) {
  useEffect(() => {
    return createCallback<TM>(type, callback);
  }, []);
}

export default async function () {
  createCallback<ToastMessage>('toast', (data) => {
    const send = toast[data.type] ?? toast.error;
    send(data.message, { richColors: true });
  });
}
