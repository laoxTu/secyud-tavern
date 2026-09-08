import { v4 } from 'uuid';

import { route } from '@/interceptors/server';
import { SseEvent, sseRegistry } from '@/signal/server/manager';
import { response } from '@/utils/server/response';

export default {
  sse: {
    /**
     * 获取一个sse单向长连接信号
     * 获取服务器广播的sse事件
     */
    GET: route(async (request) => {
      const id = v4();
      const unregisterEvent = () => {
        sseRegistry.unregister(id);
      };
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          const event: SseEvent = {
            id,
            send: (message) => {
              controller.enqueue(
                encoder.encode(
                  `event: ${message.type}\ndata: ${JSON.stringify(message.data)}\n\n`,
                ),
              );
            },
          };
          sseRegistry.register(event);
          request.signal.addEventListener('abort', unregisterEvent);
        },
        cancel() {
          unregisterEvent();
        },
      });
      return response.create(stream, {
        // 设置 Server-Sent Events (SSE) 相关的 headers
        headers: {
          Connection: 'keep-alive',
          'Content-Encoding': 'none',
          'Cache-Control': 'no-cache, no-transform',
          'Content-Type': 'text/event-stream; charset=utf-8',
        },
      });
    }),
  },
};
