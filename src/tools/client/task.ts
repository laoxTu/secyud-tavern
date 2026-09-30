import { signals } from '@/signal';
import { Realm } from '@/stories';
import { useRealmState } from '@/stories/client/realms';
import { TaskInfo, TaskRunner } from '@/tasks';

import { ToolCall } from '..';

import { ToolCache } from './realm';

import { tools } from '.';

/**
 * 工具调用的任务管理，管理当前执行的调用。
 */
class Manager extends TaskRunner<ToolCall> {
  constructor(
    protected cache: ToolCache,
    protected controller: AbortController,
  ) {
    super();
    signals.setAbort(controller.signal, () => {
      this.pending.length = 0;
    });
  }

  protected async execute(task: TaskInfo<ToolCall>) {
    const toolcall = task.args;
    const { setRealmInfo } = useRealmState.getState();
    try {
      // 按函数名找配置，再经 toolId 找具体实现。
      const tool = this.cache.tools[toolcall.name];
      if (tool) {
        console.debug(`[tool]: `, tool.name);
        const args = JSON.parse(toolcall.arguments);
        setRealmInfo(toolcall.id, {
          title: 'tool.calling_tool',
          content: toolcall.name,
        });
        toolcall.result = await tool.invoke({
          args,
          toolcall,
          controller: this.controller,
        });
      } else {
        toolcall.result = '';
      }
    } catch (err: any) {
      // 错误写回给模型调整，同时 console.error 供人工排查。
      toolcall.result = `error: ${err?.message ?? 'unknown error'}`;
      console.error(err);
    } finally {
      setRealmInfo(toolcall.id);
    }

    return 'success';
  }
  protected async run(task: TaskInfo<ToolCall>) {
    await super.run(task);
  }

  protected async finish(task: TaskInfo<ToolCall>) {
    await super.finish(task);
    this.check();
  }

  private resolve?: (value: void | PromiseLike<void>) => void;
  private promise?: Promise<void>;

  check() {
    if (this.running.size || this.pending.length) {
      return;
    }
    this.resolve?.();
  }

  wait(): Promise<void> {
    return (this.promise ??= new Promise((resolve) => {
      this.resolve = resolve;
      this.check();
    }));
  }
}

export async function calling(
  realm: Realm,
  controller: AbortController,
  toolCalls?: ToolCall[],
) {
  if (!toolCalls?.length) return;
  const cache: ToolCache = tools.cache(realm);

  const { setRealmInfo } = useRealmState.getState();

  const manager = new Manager(cache, controller!);

  setRealmInfo('main', {
    title: 'tool.calling_tool',
  });

  for (const toolCall of toolCalls.filter((u) => !u.result)) {
    await manager.create(toolCall.id, toolCall);
  }

  await manager.wait();
}
