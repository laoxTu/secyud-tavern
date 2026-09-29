import { getRegistry, Registerable } from '@/plugins';
import {
  signals as main,
  SseMessage,
  SseSubscription,
  ToastMessage,
} from '@/signal';

export interface SseEvent extends Registerable {
  send: (message: SseMessage) => Promise<void>;
  /** 这个连接订阅了哪些 taskId（或业务分组 ID） */
  subscriptions: Map<string, SseSubscription>;
}

export const registry = getRegistry<SseEvent>('sse-manager');
async function send<TM>(message: SseMessage<TM>) {
  for (const record of registry.sorted()) {
    try {
      const subscription = record.subscriptions.get(message.type);
      if (!subscription) continue;
      if (subscription.status !== 'part') {
        await record.send(message);
      } else if (
        message.target &&
        subscription.targets.includes(message.target)
      ) {
        await record.send(message);
      }
    } catch (error) {
      registry.unregister(record.id);
      console.error(error);
    }
  }
}

export const signals = {
  ...main,
  registry,
  send,
  async toast(message: ToastMessage) {
    await send({
      type: 'toast',
      data: message,
    });
  },
};
