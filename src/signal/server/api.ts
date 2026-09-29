import { BusinessError } from '@/interceptors';
import { route } from '@/interceptors/server';
import { strUtils } from '@/utils';
import { response } from '@/utils/server/response';

import { SseSubscription, SseSubscriptionAction } from '..';

import { signals, SseEvent } from '.';

export default {
  sse: {
    '[id]': {
      /**
       * 获取一个sse单向长连接信号
       * 获取服务器广播的sse事件
       */
      GET: route(async (request, record) => {
        const { id } = await record.params;
        const unregisterEvent = () => {
          signals.registry.unregister(id);
        };
        const stream = new ReadableStream({
          start(controller) {
            const event: SseEvent = {
              id,
              async send(message) {
                controller.enqueue(
                  strUtils.toBuffer(
                    `event: ${message.type}\ndata: ${JSON.stringify({
                      ...message.data,
                      target: message.target,
                    })}\n\n`,
                  ),
                );
              },
              subscriptions: new Map<string, SseSubscription>(),
            };
            event.subscriptions.set('toast', {
              targets: [],
              status: 'all',
            });
            signals.registry.register(event);
            /**
             * 断联时清理
             */
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
      subscription: {
        POST: route(async (request, record) => {
          const { id } = await record.params;
          const body: SseSubscriptionAction = await request.json();

          const event = signals.registry.record(id);
          if (!event) {
            throw new BusinessError(
              'sse is not registered!',
              'error.sse.unregistered',
            ).withValue('id', id);
          }
          const { status, type } = body;
          switch (body.action) {
            case 'del':
              if (status === 'all') event.subscriptions.delete(type);
              else {
                const subscription = event.subscriptions.get(type);
                if (subscription) {
                  const set = new Set(subscription.targets);
                  for (const item of body.targets) {
                    set.delete(item);
                  }
                  if (set.size) subscription.targets = [...set];
                  else event.subscriptions.delete(type);
                }
              }
              break;
            case 'set':
              event.subscriptions.set(type, { status, targets: body.targets });
              break;
            case 'add':
              const origin = event.subscriptions.get(type);
              const targets = [
                ...new Set([...(origin?.targets ?? []), ...body.targets]),
              ];
              event.subscriptions.set(type, {
                status,
                targets,
              });
              break;
            default:
              throw new BusinessError(
                `unknown action: ${body.action}`,
                'error.sse.unknown_action',
              ).withValue('action', body.action);
          }

          return response.null();
        }),
      },
    },
  },
};
