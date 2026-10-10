import { create } from 'zustand';

import { utils } from '@/database';

export interface SseConnection {
  eventSource: EventSource;
  id: string;
}

/**
 * 获取sse信号，所有事件在一个客户端通过单例访问
 */
export const useSseConnection = create<SseConnection>(() => {
  let es = null;
  const id = utils.uuid();
  return {
    get eventSource() {
      return (es ??= new EventSource(`/api/sse/${id}`));
    },
    get id() {
      return id;
    },
  };
});
