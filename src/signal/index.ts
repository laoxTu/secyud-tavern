import { ToastType } from '@/components';
import { strUtils } from '@/utils';
import { jsonUtils } from '@/utils/json';

export interface SseSubscription {
  status: 'all' | 'part';
  targets: string[];
}

export interface SseSubscriptionAction extends SseSubscription {
  action: 'set' | 'del' | 'add';
  type: string;
}

export interface SseMessage<T = any> {
  type: string;
  data: T;
  target?: string;
}

export interface ToastMessage {
  type: ToastType;
  message: string;
  data?: Record<string, string>;
}

async function pack(items: AsyncIterable<any>) {
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const item of items) {
          controller.enqueue(
            strUtils.toBuffer(`data: ${JSON.stringify(item)}\n\n`),
          );
        }
        controller.enqueue(strUtils.toBuffer('data: [DONE]\n\n'));
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
async function* read(stream: ReadableStream) {
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

/**
 * 为信号添加子控制器，并提供销毁方法
 */
function createSub(signal: AbortSignal) {
  const controller = new AbortController();
  const abort = () => {
    controller.abort(signal.reason);
    destroy();
  };

  const destroy = () => {
    signal.removeEventListener('abort', abort);
  };

  if (signal.aborted) {
    abort();
  } else {
    signal.addEventListener('abort', abort);
  }

  return {
    controller,
    destroy,
  };
}

export const signals = {
  setAbort,
  createSub,
};
