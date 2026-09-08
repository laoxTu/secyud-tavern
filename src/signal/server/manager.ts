import { getRegistry, Registerable } from '@/plugins';
import { SseMessage } from '@/signal';

export interface SseEvent extends Registerable {
  send: (message: SseMessage) => void;
}

export const sseRegistry = getRegistry<SseEvent>('sse-manager');

export const sseManager = {
  send<TM>(message: SseMessage<TM>) {
    for (const record of sseRegistry.sorted()) {
      try {
        record.send(message);
      } catch (error) {
        console.error(error);
      }
    }
  },
};
