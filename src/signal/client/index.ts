'use client';
import { useEffect } from 'react';
import { create } from 'zustand';

export interface SseConnection {
  eventSource: EventSource;
}

/**
 * 获取sse信号，所有事件在一个客户端通过单例访问
 */
export const useSseConnection = create<SseConnection>(() => {
  return {
    eventSource: new EventSource('/api/sse'),
  };
});

/**
 * 监听sse事件
 * @param type 事件类型
 * @param callback 回调函数
 */
export function useSse<TM>(type: string, callback: (data: TM) => void) {
  const connection = useSseConnection();
  useEffect(() => {
    const es = connection.eventSource;
    const action = (event: MessageEvent) => {
      if (event.type === type) {
        callback(JSON.parse(event.data));
      }
    };
    es.addEventListener(type, action);
    return () => {
      es.removeEventListener(type, action);
    };
  }, [connection]);
}
