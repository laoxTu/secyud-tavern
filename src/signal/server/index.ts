import { getRegistry, Registerable } from '@/plugins';
import { signals as main, SseMessage, ToastMessage } from '@/signal';

export interface SseEvent extends Registerable {
  send: (message: SseMessage) => Promise<void>;
}

export const registry = getRegistry<SseEvent>('sse-manager');
async function send<TM>(message: SseMessage<TM>) {
  for (const record of registry.sorted()) {
    try {
      await record.send(message);
    } catch (error) {
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
