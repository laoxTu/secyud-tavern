import { Entity, Properties, utils } from '@/database';
import { BusinessError, errors } from '@/interceptors';
import { Mutex } from '@/utils/mutex';

export type TaskStatus =
  'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

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
  progress?: number;
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
 * 简易并行任务调度
 */
export abstract class TaskRunner<TArgs = any> {
  protected pending: Task[] = [];
  protected running: Map<string, Task> = new Map<string, Task>();
  protected mutex = new Mutex();

  constructor(protected max: number = 8) {}

  protected abstract execute(task: TArgs): Promise<string | undefined>;

  protected abstract cancel(task: TArgs): Promise<void>;

  protected async queue(task: Task<TArgs>) {
    await this.mutex.lock(async () => {
      this.pending.push(task);
      task.queue = Date.now();
      task.status = 'pending';
    });
  }

  protected async start() {
    await this.mutex.lock(async () => {
      // 超出任务上限
      if (this.max <= this.running.size)
        throw new BusinessError('running task over limit!');
      const task = this.pending.shift();
      if (!task) return;
      this.running.set(task.id, task);
      await this.run(task);
    });
  }

  protected async restart(task: Task<TArgs>) {
    await this.mutex.lock(async () => {
      if (!this.running.has(task.id))
        throw new BusinessError('only running task canbe restart!');
      await this.cancel(task.args);
      await this.run(task);
    });
  }

  protected async run(task: Task<TArgs>) {
    task.status = 'running';
    task.start = Date.now();
    this.execute(task.args)
      .then((result) => this.success(task, result))
      .catch((err) => this.failed(task, err))
      .finally(() => this.finish(task));
  }

  protected async failed(task: Task<TArgs>, err: any) {
    task.status = 'failed';
    task.result = errors.serialize(err);
  }

  protected async success(task: Task<TArgs>, result?: string) {
    task.status = 'completed';
    task.result = result;
  }

  protected async finish(task: Task<TArgs>) {
    await this.mutex.lock(async () => {
      this.running.delete(task.id);
    });
    await this.start();
  }

  async delete(id: string, cancel: boolean = true) {
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
        this.running.delete(id);
        if (cancel) await this.cancel(task.args);
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
