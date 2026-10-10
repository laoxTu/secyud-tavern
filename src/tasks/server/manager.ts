import { BusinessError } from '@/interceptors';
import { getRegistry, getSingleton, Registerable } from '@/plugins';

import { TaskInfo, TaskRunner } from '..';

import { repository } from './repository';

export interface TaskArgs {
  provider: string;
}

export interface TaskProvider<T = any> extends Registerable {
  execute(args: T, controller: AbortController): Promise<void>;
}

export const registry = getRegistry<TaskProvider>('task_provider');

export class TaskManager extends TaskRunner<TaskArgs> {
  constructor() {
    super(8);
  }

  protected async execute(task: TaskInfo<TaskArgs>) {
    const provider = registry.record(task.args.provider);
    // 没注册 provider 说明这个任务什么都不会跑，必须显式失败
    if (!provider) {
      throw new BusinessError(
        `task provider ${task.args.provider} is not registered.`,
        'error.task.provider_not_registered',
      ).withValue('type', task.args.provider);
    }
    await provider.execute(task.args, task.controller);
    return 'success';
  }

  protected async finish(task: TaskInfo<TaskArgs>) {
    await super.finish(task);
    // 结束时更新数据库
    await repository.update(task.id, {
      finish: task.finish,
      status: task.status,
      result: task.result,
    });
  }
  async restart(id: string) {
    const task = this.running.get(id);
    // 重试时需要记录历史
    if (task) await repository.history.add(task.id, task);
    await super.restart(id);
  }

  protected async run(task: TaskInfo<TaskArgs>) {
    await super.run(task);
    // 启动时更新数据库
    await repository.update(task.id, {
      start: task.start,
      status: task.status,
      attempt: task.attempt,
    });
  }

  async delete(id: string) {
    await super.delete(id);
    await repository.delete(id);
  }

  async create<T extends TaskArgs = TaskArgs>(name: string, args: T) {
    const task = await super.create(name, args);
    await repository.create(task);
    return task;
  }

  get(id: string) {
    return this.running.get(id);
  }
}

export const manager = getSingleton('task_manager', () => new TaskManager());
