import { getRegistry, getSingleton, Registerable } from '@/plugins';

import { TaskRunner } from '..';

import { repository } from './repository';

export interface TaskArgs {
  provider: string;
}

export interface TaskProvider<T = any> extends Registerable {
  execute(args: T): Promise<void>;
  cancel?: (args: T) => Promise<void>;
}

export const registry = getRegistry<TaskProvider>('task_provider');

export class TaskManager extends TaskRunner<TaskArgs> {
  constructor() {
    super(8);
  }

  protected async execute(args: TaskArgs) {
    const provider = registry.record(args.provider);
    await provider?.execute(args);
    return 'success';
  }
  protected async cancel(args: TaskArgs) {
    const provider = registry.record(args.provider);
    await provider?.cancel?.(args);
  }

  async delete(id: string, cancel: boolean) {
    await super.delete(id, cancel);
    await repository.delete(id);
  }

  async create<T extends TaskArgs = TaskArgs>(name: string, args: T) {
    const task = await super.create(name, args);
    await repository.create(task);
    return task;
  }
}

export const manager = getSingleton('task_manager', () => new TaskManager());
