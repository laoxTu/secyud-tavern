import { jsonUtils } from '@/utils/json';

export interface SseMessage<T = any> {
  type: string;
  data: T;
}

export async function pack(items: AsyncIterable<any>) {
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const item of items) {
          controller.enqueue(
            new TextEncoder().encode(`data: ${JSON.stringify(item)}\n\n`),
          );
        }
        controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });
}

/**
 * sse 流解析
 * @param stream
 */
export async function* read(stream: ReadableStream) {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  try {
    let buffer = '';
    while (true) {
      const { done, value } = await reader.read();
      buffer += decoder.decode(value, { stream: true });
      const allEvents = buffer.split('\n\n');
      const events = done ? allEvents : allEvents.slice(0, -1);
      for (const event of events) {
        const json = analyzeEvent(event);
        if (json) yield json;
      }
      if (done) break;
      if (allEvents.length > 1) buffer = allEvents[allEvents.length - 1];
    }
  } catch (err) {
    throw err;
  } finally {
    reader.releaseLock();
  }

  function analyzeEvent(event: string) {
    const dataList = event.split('\n');
    let jsonData = '';
    for (const data of dataList) {
      if (data.startsWith('data:')) {
        let content = data.slice(5); // 移除 "data:"
        // 标准：只移除第一个前导空格
        if (content.startsWith(' ')) {
          content = content.slice(1);
        }
        if (jsonData) jsonData += '\n';
        jsonData += content;
      }
    }
    return jsonData === '[DONE]' ? null : jsonUtils.parse(jsonData);
  }
}

export const sseUtils = {
  pack,
  read,
};

export type SignalBinder = (c?: AbortController | null) => Promise<void>;

/**
 * 为信号添加abort操作，自动析构
 * @param signal 信号
 * @param action 操作
 */
function setAbort(signal: AbortSignal, action: (event: Event) => void) {
  const abort = (event: Event) => {
    action(event);
    signal.removeEventListener('abort', abort);
  };
  signal.addEventListener('abort', abort);
}

export const signalUtils = {
  setAbort,
};
