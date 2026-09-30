import { del, get, post } from '@/client';
import { DataRequest, DataResponse } from '@/database';

import { Task, TaskRequestParam } from '..';

export const proxy = {
  async list(
    request?: DataRequest<TaskRequestParam>,
  ): Promise<DataResponse<Task>> {
    return await get('tasks', {
      params: request,
    });
  },
  async delete(id: string): Promise<void> {
    await del('tasks/{id}', {
      params: { id },
    });
  },
  async restart(id: string): Promise<void> {
    await post('tasks/{id}/restart', {
      params: { id },
    });
  },
};
