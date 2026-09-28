import { and, eq, like, SQL } from 'drizzle-orm';
import { v4 } from 'uuid';

import { DataRequest } from '@/database';
import { databases } from '@/database/server';
import { checker } from '@/interceptors';
import {
  Task,
  TaskHistory,
  TaskRequestOptions,
  TaskRequestParam,
} from '@/tasks';

import { taskHistorySchema, taskSchema } from './schema';

const { db } = databases;

async function get(id: string, options?: TaskRequestOptions) {
  const taskOrNull = await databases.get<Task, typeof taskSchema>(
    taskSchema,
    id,
  );
  const task = checker.notNullEntity(id, taskOrNull, 'task.id');
  return task;
}

async function create(task: Task) {
  checker.notNullOrWhitespace('name', task.name);
  task.status ??= 'pending';
  task.attempt ??= 0;
  if (!task.id) task.id = v4();
  await db.insert(taskSchema).values(task);
  return task.id;
}

async function update(id: string, task: Partial<Task>) {
  checker.notWhitespace('name', task.name);
  task.id = undefined;
  await db.update(taskSchema).set(task).where(eq(taskSchema.id, id));
  return id;
}

async function _delete(id: string) {
  await databases.delete(taskSchema, id);
}

async function exist(condition: (table: typeof taskSchema) => SQL) {
  return await databases.exists(taskSchema, condition);
}

/**
 * list只挑选name value值
 * @param request
 */
async function list(request: DataRequest<TaskRequestParam>) {
  return await databases.query<Task, typeof taskSchema>(
    taskSchema,
    request,
    (t) => {
      const condition: SQL[] = [];
      if (request.search) {
        const { fuzzy } = request.search;
        if (fuzzy) {
          condition.push(like(t.name, `%${fuzzy}%`));
        }
      }

      return condition.length ? and(...condition) : undefined;
    },
    (t) => t.name,
    (t) => ({
      id: t.id,
      name: t.name,
      progress: t.progress,
    }),
  );
}

const history = {
  /**
   * 获取历史
   */
  get: async (id: string, attempt: number): Promise<TaskHistory> => {
    const [history] = await db
      .select()
      .from(taskHistorySchema)
      .where(
        and(
          eq(taskHistorySchema.masterId, id),
          eq(taskHistorySchema.attempt, attempt),
        ),
      )
      .limit(1);
    return history as TaskHistory;
  },
  /**
   * 创建历史
   */
  add: async (id: string, history: TaskHistory) => {
    history.masterId = id;
    await db.insert(taskHistorySchema).values(history);
  },
  /**
   * 删除历史
   */
  del: async (id: string, attempt: number) => {
    await db
      .delete(taskHistorySchema)
      .where(
        and(
          eq(taskHistorySchema.masterId, id),
          eq(taskHistorySchema.attempt, attempt),
        ),
      );
  },
};

export const repository = {
  get,
  create,
  update,
  delete: _delete,
  list,
  exist,
  history,
};
