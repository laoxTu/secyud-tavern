import { getRegistry, getSingleton, Registerable } from '@/plugins';

import { Task, TaskRunner } from '..';

import { repository } from './repository';

export interface TaskProvider<T = any> extends Registerable {
  execute(args: T): Promise<void>;
  cancel?: (args: T) => Promise<void>;
}

export const registry = getRegistry<TaskProvider>('task_provider');

export class TaskManager extends TaskRunner {
  constructor() {
    super(8);
  }

  protected async execute<TArgs = any>(task: Task<TArgs>) {
    const provider = registry.record(task.provider);
    await provider?.execute(task.args);
    return 'success';
  }
  protected async cancel<TArgs = any>(task: Task<TArgs>) {
    const provider = registry.record(task.provider);
    await provider?.cancel?.(task.args);
  }

  async delete(id: string, cancel: boolean) {
    await super.delete(id, cancel);
    await repository.delete(id);
  }

  async create<TArgs = any>(provider: string, name: string, args: TArgs) {
    const task = await super.create(provider, name, args);
    await repository.create(task);
    return task;
  }
}

export const manager = getSingleton('task_manager', () => new TaskManager());
