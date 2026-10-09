import { Entity, Properties, utils } from '@/database';
import { BusinessError, errors } from '@/interceptors';
import { Mutex } from '@/utils/mutex';

export type TaskStatus =
  'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface TaskProgress {
  progress: number;
}

interface TaskBase {
  // 尝试次数
  attempt: number;
  // 当前尝试入队时间
  queue?: number | null;
  // 当前任务开始时间
  start?: number | null;
  // 当前任务结束时间
  finish?: number | null;
  // 任务结果，成功情况或失败原因
  result?: string | null;
  // 任务状态
  status: TaskStatus;
}

/**
 * 当前任务状态
 */
export interface Task<T = any> extends Entity, Properties, TaskBase {
  name: string;
  args: T;
}

/**
 * 状态归档
 * pk: masterId + attempt
 * 新尝试时归档原状态
 */
export interface TaskHistory extends TaskBase {
  masterId: string;
}

/**
 * 运行中状态
 */
export interface TaskInfo<T = any> extends Task<T> {
  controller: AbortController;
}

/**
 * 简易并行任务调度
 */
export abstract class TaskRunner<TArgs = any> {
  protected pending: Task[] = [];
  protected running: Map<string, TaskInfo> = new Map<string, TaskInfo>();
  protected mutex = new Mutex();

  constructor(protected max: number = 8) {}

  /**
   * 异步执行任务
   * 通过AbortController取消任务
   * @param task 执行的任务
   */
  protected abstract execute(
    task: TaskInfo<TArgs>,
  ): Promise<string | undefined>;

  protected async queue(task: Task<TArgs>) {
    await this.mutex.lock(async () => {
      this.pending.push(task);
      task.queue = Date.now();
      task.status = 'pending';
    });
  }

  async start() {
    let task: TaskInfo | undefined;
    await this.mutex.lock(async () => {
      // 超出任务上限
      if (this.max <= this.running.size)
        throw new BusinessError('running task over limit!');
      const top = this.pending.shift();
      if (!top) return;
      task = {
        ...top,
        controller: new AbortController(),
      };
      this.running.set(task.id, task);
      await this.run(task);
    });

    return task;
  }

  async restart(id: string) {
    await this.mutex.lock(async () => {
      if (!this.running.has(id))
        throw new BusinessError('only running task canbe restart!');
      const origin = this.running.get(id)!;
      // 重试任务前应当先取消任务
      origin.controller.abort(new BusinessError('restart', `error.restart`));
      // 新任务不要和前面的混用引用，建立新实例
      const task = {
        ...origin,
        controller: new AbortController(),
        attempt: origin.attempt + 1,
      };
      await this.run(task);
    });
  }

  protected async run(task: TaskInfo<TArgs>) {
    task.status = 'running';
    task.start = Date.now();
    this.execute(task)
      .then((result) => this.success(task, result))
      .catch((err) => this.failed(task, err))
      .finally(() => this.finish(task));
  }

  protected async failed(task: TaskInfo<TArgs>, err: any) {
    task.status = 'failed';
    task.result = errors.serialize(err);
  }

  protected async success(task: TaskInfo<TArgs>, result?: string) {
    task.status = 'completed';
    task.result = result;
  }

  protected async finish(task: TaskInfo<TArgs>) {
    await this.mutex.lock(async () => {
      this.running.delete(task.id);
      task.finish = Date.now();
    });
    await this.start();
  }

  async delete(id: string) {
    await this.mutex.lock(async () => {
      const index = this.pending.findIndex((u) => u.id === id);
      if (index >= 0) {
        this.pending[index].status = 'cancelled';
        this.pending.splice(index, 1);
        return;
      }
      const task = this.running.get(id);
      if (task) {
        task.status = 'cancelled';
        // 删除任务应当对进行中的任务进行取消
        // 取消是否回档取决于内部实现
        // 但是已完成的任务一定不会回档
        task.controller.abort(new BusinessError('canceled', `error.canceled`));
        this.running.delete(id);
      }
    });
    await this.start();
  }

  async create<T extends TArgs = TArgs>(name: string, args: T) {
    const task: Task = {
      name,
      args,
      id: utils.uuid(),
      attempt: 0,
      status: 'pending',
    };
    await this.queue(task);
    await this.start();
    return task;
  }
}

export interface TaskRequestOptions {}
export interface TaskRequestParam {
  fuzzy?: string | null;
}

export const tasks = {
  name: 'task',
};
